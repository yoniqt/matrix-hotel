const express = require("express");
const router = express.Router();
const db = require("../config/db");
const {
  PENDING_EXPIRY_MINUTES,
  expireStalePending,
} = require("../utils/bookingExpiry");

const REF_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I - easier to read at check-in

function generateBookingReference() {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  }
  return `MTX-${code}`;
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

// GET /api/bookings - list all bookings (admin view)
router.get("/", async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT bookings.*, guests.name AS guest_name, guests.email AS guest_email,
              rooms.room_number, rooms.room_type
       FROM bookings
       JOIN guests ON bookings.guest_id = guests.id
       JOIN rooms ON bookings.room_id = rooms.id
       ORDER BY bookings.check_in_date`
    );
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
});

// POST /api/bookings - create one or more pending bookings (one per room_id)
// under a single shared booking_reference. Nothing is "confirmed" for the
// guest yet - status holds the room(s) so nobody else can grab them while
// payment is pending, but payment_status stays 'pending' until the
// simulated payment step below flips it to 'paid'.
router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    room_ids,
    check_in_date,
    check_out_date,
    special_requests,
    guests_count,
  } = req.body;

  if (
    !name ||
    !email ||
    !phone ||
    !Array.isArray(room_ids) ||
    room_ids.length === 0 ||
    !check_in_date ||
    !check_out_date
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  if (new Date(check_in_date) >= new Date(check_out_date)) {
    return res.status(400).json({
      success: false,
      message: "Check-out date must be after check-in date.",
    });
  }

  try {
    // Step 1: overlap check for every requested room - if any one of them
    // is already taken for these dates, reject the whole request rather
    // than partially booking.
    for (const roomId of room_ids) {
      const [conflicts] = await db.query(
        `SELECT id FROM bookings
         WHERE room_id = ?
           AND status != 'cancelled'
           AND check_in_date < ?
           AND check_out_date > ?`,
        [roomId, check_out_date, check_in_date]
      );
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: "One of the selected rooms is no longer available for these dates.",
        });
      }
    }

    // Step 2: find or create the guest
    const [existingGuest] = await db.query(
      "SELECT id FROM guests WHERE email = ?",
      [email]
    );

    let guestId;
    if (existingGuest.length > 0) {
      guestId = existingGuest[0].id;
    } else {
      const [newGuest] = await db.query(
        "INSERT INTO guests (name, email, phone) VALUES (?, ?, ?)",
        [name, email, phone]
      );
      guestId = newGuest.insertId;
    }

    // Step 3: create one pending booking row per room, all sharing the
    // same reference so they can be looked up/paid/cancelled as a group.
    const bookingReference = generateBookingReference();
    for (const roomId of room_ids) {
      await db.query(
        `INSERT INTO bookings
          (guest_id, room_id, check_in_date, check_out_date, special_requests, status, guests_count, booking_reference, payment_status)
         VALUES (?, ?, ?, ?, ?, 'confirmed', ?, ?, 'pending')`,
        [
          guestId,
          roomId,
          check_in_date,
          check_out_date,
          special_requests || null,
          guests_count || 1,
          bookingReference,
        ]
      );
    }

    const [priceRows] = await db.query(
      `SELECT price_per_night FROM rooms WHERE id IN (?)`,
      [room_ids]
    );
    const nights = nightsBetween(check_in_date, check_out_date);
    const totalAmount = priceRows.reduce(
      (sum, r) => sum + Number(r.price_per_night) * nights,
      0
    );

    const expiresAt = new Date(
      Date.now() + PENDING_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    res.status(201).json({
      success: true,
      data: {
        booking_reference: bookingReference,
        total_amount: totalAmount,
        nights,
        room_count: room_ids.length,
        check_in_date,
        check_out_date,
        expires_at: expiresAt,
      },
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ success: false, message: "Failed to create booking." });
  }
});

// GET /api/bookings/reference/:ref - look up a booking group by its
// shared reference code. Used by the payment modal to poll for a
// payment_status change (the "polling endpoint" side of payment
// verification, since there's no real payment gateway wired up here).
router.get("/reference/:ref", async (req, res) => {
  try {
    // Check-and-expire on demand first, so a guest polling this exact
    // reference sees 'expired' the moment the 30 minutes are up, without
    // waiting for the next periodic sweep tick.
    await expireStalePending(req.params.ref);

    const [rows] = await db.query(
      `SELECT bookings.*, guests.name AS guest_name, guests.email AS guest_email,
              rooms.room_number, rooms.room_type, rooms.price_per_night,
              DATE_ADD(bookings.created_at, INTERVAL ? MINUTE) AS expires_at
       FROM bookings
       JOIN guests ON bookings.guest_id = guests.id
       JOIN rooms ON bookings.room_id = rooms.id
       WHERE bookings.booking_reference = ?`,
      [PENDING_EXPIRY_MINUTES, req.params.ref]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const nights = nightsBetween(rows[0].check_in_date, rows[0].check_out_date);
    const totalAmount = rows.reduce(
      (sum, r) => sum + Number(r.price_per_night) * nights,
      0
    );

    res.json({
      success: true,
      data: {
        booking_reference: req.params.ref,
        status: rows[0].status,
        payment_status: rows[0].payment_status,
        guest_name: rows[0].guest_name,
        guest_email: rows[0].guest_email,
        check_in_date: rows[0].check_in_date,
        check_out_date: rows[0].check_out_date,
        expires_at: rows[0].expires_at,
        nights,
        total_amount: totalAmount,
        rooms: rows.map((r) => ({
          room_number: r.room_number,
          room_type: r.room_type,
          price_per_night: r.price_per_night,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching booking by reference:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch booking." });
  }
});

// POST /api/bookings/reference/:ref/simulate-payment - stands in for the
// real payment gateway's webhook. In a production build this route would
// not exist - PayMongo/Xendit/Maya would call a webhook endpoint instead
// once their QR Ph payment actually settles.
router.post("/reference/:ref/simulate-payment", async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE bookings SET payment_status = 'paid'
       WHERE booking_reference = ? AND payment_status = 'pending'`,
      [req.params.ref]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending booking found for that reference.",
      });
    }

    res.json({ success: true, message: "Payment marked as received." });
  } catch (error) {
    console.error("Error simulating payment:", error.message);
    res.status(500).json({ success: false, message: "Failed to update payment status." });
  }
});

// POST /api/bookings/reference/:ref/cancel - releases the held room(s) if
// the guest backs out of a still-pending payment.
router.post("/reference/:ref/cancel", async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE bookings SET status = 'cancelled', payment_status = 'cancelled'
       WHERE booking_reference = ? AND payment_status = 'pending'`,
      [req.params.ref]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "No pending booking found for that reference.",
      });
    }

    res.json({ success: true, message: "Booking cancelled." });
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ success: false, message: "Failed to cancel booking." });
  }
});

module.exports = router;
