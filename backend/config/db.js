require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Aiven enforces SSL (ssl-mode=REQUIRED) - without this the connection
  // is rejected outright. Local MySQL has no DB_SSL_CA set, so ssl stays
  // undefined there and the plain unencrypted connection still works.
  // DB_SSL_CA is either a file path (local dev) or the raw PEM text
  // (hosts like Render only let you paste an env var's value, not point
  // it at a file on disk).
  ssl: process.env.DB_SSL_CA
    ? {
        ca: process.env.DB_SSL_CA.startsWith("-----BEGIN")
          ? process.env.DB_SSL_CA
          : fs.readFileSync(process.env.DB_SSL_CA),
      }
    : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  // Without this, mysql2 returns DATE columns as JS Date objects, which
  // get serialized through a UTC conversion - a date stored as 2026-09-01
  // comes back as "2026-08-31T16:00:00.000Z" (off by a day depending on
  // local timezone). Plain date strings avoid that entirely.
  dateStrings: true,
});

module.exports = pool;
