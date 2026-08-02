const express = require("express");
const router = express.Router();
const db = require("../config/db");

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

// POST /api/bookings - create a new booking
router.post("/", async (req, res) => {
  const {
    name,
    email,
    phone,
    room_id,
    check_in_date,
    check_out_date,
    special_requests,
  } = req.body;

  if (!name || !email || !phone || !room_id || !check_in_date || !check_out_date) {
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
    // Step 1: the overlap check. This is the core rule that prevents
    // double-booking: any existing (non-cancelled) booking for this room
    // whose check_in is before our new check_out, AND whose check_out is
    // after our new check_in, counts as a conflict.
    const [conflicts] = await db.query(
      `SELECT id FROM bookings
       WHERE room_id = ?
         AND status != 'cancelled'
         AND check_in_date < ?
         AND check_out_date > ?`,
      [room_id, check_out_date, check_in_date]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This room is already booked for the selected dates.",
      });
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

    // Step 3: create the booking
    const [result] = await db.query(
      `INSERT INTO bookings
        (guest_id, room_id, check_in_date, check_out_date, special_requests, status)
       VALUES (?, ?, ?, ?, ?, 'confirmed')`,
      [guestId, room_id, check_in_date, check_out_date, special_requests || null]
    );

    res.status(201).json({
      success: true,
      message: "Booking confirmed!",
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({ success: false, message: "Failed to create booking." });
  }
});

module.exports = router;
