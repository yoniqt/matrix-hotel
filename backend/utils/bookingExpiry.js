const db = require("../config/db");

const PENDING_EXPIRY_MINUTES = 30;

// Called on-demand (every time the payment modal polls a specific
// reference) so expiry is accurate even between periodic sweep ticks.
async function expireStalePending(bookingReference) {
  await db.query(
    `UPDATE bookings
     SET status = 'cancelled', payment_status = 'expired'
     WHERE booking_reference = ?
       AND payment_status = 'pending'
       AND created_at < (NOW() - INTERVAL ? MINUTE)`,
    [bookingReference, PENDING_EXPIRY_MINUTES]
  );
}

// Called on a timer from server.js so a booking still expires and releases
// its room hold even if nobody's tab is open polling it.
async function expireAllStalePending() {
  const [result] = await db.query(
    `UPDATE bookings
     SET status = 'cancelled', payment_status = 'expired'
     WHERE payment_status = 'pending'
       AND created_at < (NOW() - INTERVAL ? MINUTE)`,
    [PENDING_EXPIRY_MINUTES]
  );
  return result.affectedRows;
}

module.exports = { PENDING_EXPIRY_MINUTES, expireStalePending, expireAllStalePending };
