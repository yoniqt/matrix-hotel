"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function BookingReceipt({ booking, currency, formatPrice }) {
  const [checkinQr, setCheckinQr] = useState(null);

  useEffect(() => {
    const payload = `matrixhotel-demo-checkin://${booking.booking_reference}`;
    QRCode.toDataURL(payload, { width: 200, margin: 1 }).then(setCheckinQr);
  }, [booking.booking_reference]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8">
      <div className="text-center print:hidden">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
          ✓
        </span>
      </div>

      <h1 className="mt-4 text-center text-2xl font-bold text-[var(--text-primary)]">
        Booking Confirmed
      </h1>
      <p className="mt-1 text-center text-sm text-[var(--text-secondary)]">
        A confirmation has been sent to {booking.guest_email}
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-[var(--border-color)] p-4 text-center">
        <p className="text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
          Booking Reference
        </p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-wide text-[var(--accent-color)]">
          {booking.booking_reference}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--text-secondary)]">
        <div className="flex justify-between">
          <span>Guest</span>
          <span className="text-[var(--text-primary)]">{booking.guest_name}</span>
        </div>
        <div className="flex justify-between">
          <span>Check-in</span>
          <span className="text-[var(--text-primary)]">{booking.check_in_date}</span>
        </div>
        <div className="flex justify-between">
          <span>Check-out</span>
          <span className="text-[var(--text-primary)]">{booking.check_out_date}</span>
        </div>
        <div className="flex justify-between">
          <span>Nights</span>
          <span className="text-[var(--text-primary)]">{booking.nights}</span>
        </div>
        <div className="flex justify-between">
          <span>Rooms</span>
          <span className="text-[var(--text-primary)]">
            {booking.rooms.length}x {booking.rooms[0]?.room_type}
          </span>
        </div>
        <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-base font-bold">
          <span className="text-[var(--text-primary)]">Total Paid</span>
          <span className="text-[var(--text-primary)]">
            {formatPrice(booking.total_amount, currency)}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center border-t border-[var(--border-color)] pt-6">
        <p className="text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
          Check-in QR Code
        </p>
        <p className="mt-1 text-center text-xs text-[var(--text-secondary)]">
          Show this at the front desk for a faster check-in.
        </p>
        {checkinQr && (
          <img
            src={checkinQr}
            alt="Check-in QR code"
            className="mt-3 h-40 w-40 rounded-xl border border-[var(--border-color)] bg-white p-2"
          />
        )}
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-8 w-full rounded-full bg-[var(--accent-color)] px-6 py-3 font-medium text-black transition-opacity hover:opacity-90 print:hidden"
      >
        Print / Save as PDF
      </button>
    </div>
  );
}
