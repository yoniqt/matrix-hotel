const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /api/rooms - list all rooms
router.get("/", async (req, res) => {
  try {
    const [rooms] = await db.query("SELECT * FROM rooms ORDER BY room_number");
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch rooms." });
  }
});

// GET /api/rooms/available?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
// Returns only rooms that do NOT have a conflicting booking for the given
// dates - this reuses the exact same overlap condition as booking creation,
// just to filter a list instead of validating a single new booking.
router.get("/available", async (req, res) => {
  const { check_in, check_out } = req.query;

  if (!check_in || !check_out) {
    return res.status(400).json({
      success: false,
      message: "check_in and check_out dates are required.",
    });
  }

  if (new Date(check_in) >= new Date(check_out)) {
    return res.status(400).json({
      success: false,
      message: "Check-out date must be after check-in date.",
    });
  }

  try {
    const [rooms] = await db.query(
      `SELECT * FROM rooms
       WHERE id NOT IN (
         SELECT room_id FROM bookings
         WHERE status != 'cancelled'
           AND check_in_date < ?
           AND check_out_date > ?
       )
       ORDER BY room_number`,
      [check_out, check_in]
    );

    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Error fetching available rooms:", error.message);
    res.status(500).json({ success: false, message: "Failed to fetch available rooms." });
  }
});

module.exports = router;
