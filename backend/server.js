require("dotenv").config();
const express = require("express");
const cors = require("cors");

const roomsRouter = require("./routes/rooms");
const bookingsRouter = require("./routes/bookings");
const { expireAllStalePending } = require("./utils/bookingExpiry");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Reservation system API is running." });
});

// Sweep for pending bookings past their 30-minute payment window every
// minute, so a room's hold is released even if nobody has the payment
// modal open polling that specific booking.
setInterval(() => {
  expireAllStalePending()
    .then((count) => {
      if (count > 0) console.log(`Expired ${count} stale pending booking row(s).`);
    })
    .catch((err) => console.error("Expiry sweep failed:", err.message));
}, 60 * 1000);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
