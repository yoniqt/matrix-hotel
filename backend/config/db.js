require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Without this, mysql2 returns DATE columns as JS Date objects, which
  // get serialized through a UTC conversion - a date stored as 2026-09-01
  // comes back as "2026-08-31T16:00:00.000Z" (off by a day depending on
  // local timezone). Plain date strings avoid that entirely.
  dateStrings: true,
});

module.exports = pool;
