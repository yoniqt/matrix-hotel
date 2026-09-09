const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const requireAdminAuth = require("../middleware/adminAuth");

// POST /api/admin/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password are required." });
  }

  try {
    const [rows] = await db.query("SELECT * FROM admins WHERE username = ?", [username]);
    const admin = rows[0];

    // Compare against a dummy hash when the username doesn't exist, so a
    // wrong username doesn't return faster than a wrong password - that
    // timing difference is enough to let an attacker enumerate valid
    // usernames.
    const hash = admin ? admin.password_hash : "$2a$10$invalidsaltinvalidsaltinvalidsalthashvalue1234567890";
    const passwordMatches = await bcrypt.compare(password, hash);

    if (!admin || !passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }

    const token = jwt.sign(
      { adminId: admin.id, username: admin.username },
      process.env.ADMIN_JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ success: true, data: { token, username: admin.username } });
  } catch (error) {
    console.error("Error logging in admin:", error.message);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// GET /api/admin/bookings - full booking list with guest/room details
router.get("/bookings", requireAdminAuth, async (req, res) => {
  try {
    const [bookings] = await db.query(
      `SELECT bookings.*, guests.name AS guest_name, guests.email AS guest_email,
              guests.phone AS guest_phone, rooms.room_number, rooms.room_type
       FROM bookings
       JOIN guests ON bookings.guest_id = guests.id
       JOIN rooms ON bookings.room_id = rooms.id
       ORDER BY bookings.check_in_date DESC`
    );
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error("Error fetching admin bookings:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
});

// PATCH /api/admin/bookings/:id/cancel - admin override, works regardless
// of payment_status (unlike the guest-facing cancel route, which only
// works while a booking is still pending payment).
router.patch("/bookings/:id/cancel", requireAdminAuth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.json({ success: true, message: "Booking cancelled." });
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ success: false, message: "Failed to cancel booking." });
  }
});

// POST /api/admin/rooms - add a new room
router.post("/rooms", requireAdminAuth, async (req, res) => {
  const { room_number, room_type, price_per_night, capacity } = req.body;

  if (!room_number || !room_type || !price_per_night || !capacity) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO rooms (room_number, room_type, price_per_night, capacity) VALUES (?, ?, ?, ?)",
      [room_number, room_type, price_per_night, capacity]
    );
    res.status(201).json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "A room with that number already exists." });
    }
    console.error("Error creating room:", error.message);
    res.status(500).json({ success: false, message: "Failed to create room." });
  }
});

// PUT /api/admin/rooms/:id - edit a room
router.put("/rooms/:id", requireAdminAuth, async (req, res) => {
  const { room_number, room_type, price_per_night, capacity } = req.body;

  if (!room_number || !room_type || !price_per_night || !capacity) {
    return res.status(400).json({ success: false, message: "All fields are required." });
  }

  try {
    const [result] = await db.query(
      "UPDATE rooms SET room_number = ?, room_type = ?, price_per_night = ?, capacity = ? WHERE id = ?",
      [room_number, room_type, price_per_night, capacity, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    res.json({ success: true, message: "Room updated." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "A room with that number already exists." });
    }
    console.error("Error updating room:", error.message);
    res.status(500).json({ success: false, message: "Failed to update room." });
  }
});

// DELETE /api/admin/rooms/:id
router.delete("/rooms/:id", requireAdminAuth, async (req, res) => {
  try {
    // rooms.id has ON DELETE CASCADE from bookings, so MySQL won't reject
    // this with a constraint error - it would silently wipe the room's
    // booking history instead. Block it explicitly if any booking
    // (including cancelled ones, for the record) still references this room.
    const [existing] = await db.query(
      "SELECT id FROM bookings WHERE room_id = ? LIMIT 1",
      [req.params.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This room has existing bookings and can't be deleted.",
      });
    }

    const [result] = await db.query("DELETE FROM rooms WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    res.json({ success: true, message: "Room deleted." });
  } catch (error) {
    console.error("Error deleting room:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete room." });
  }
});

module.exports = router;
