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

module.exports = router;
