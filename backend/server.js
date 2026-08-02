require("dotenv").config();
const express = require("express");
const cors = require("cors");

const roomsRouter = require("./routes/rooms");
const bookingsRouter = require("./routes/bookings");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomsRouter);
app.use("/api/bookings", bookingsRouter);

app.get("/", (req, res) => {
  res.json({ success: true, message: "Reservation system API is running." });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
