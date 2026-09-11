"use client";

import { useState } from "react";
import SiteHeader from "../ui/site-header";
import Footer from "../ui/footer";
import { useCurrency } from "../currency-provider";
import { formatPrice } from "../../lib/currency";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS_STYLES = {
  confirmed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

const PAYMENT_STYLES = {
  paid: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-amber-500/10 text-amber-400",
  expired: "bg-zinc-500/10 text-zinc-400",
  cancelled: "bg-red-500/10 text-red-400",
};

function Badge({ value, styles }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[value] || "bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {value}
    </span>
  );
}

export default function FindBookingPage() {
  const { currency } = useCurrency();
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | searching | error
  const [message, setMessage] = useState("");
  const [cancelling, setCancelling] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    setStatus("searching");
    setMessage("");
    setBooking(null);
    try {
      const res = await fetch(
        `${API_URL}/api/bookings/lookup?reference=${encodeURIComponent(reference.trim())}&email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (!data.success) {
        setStatus("error");
        setMessage(data.message);
        return;
      }
      setBooking(data.data);
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Could not reach the server. Try again.");
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setCancelling(true);
    try {
      const res = await fetch(
        `${API_URL}/api/bookings/reference/${booking.booking_reference}/cancel`,
        { method: "POST" }
      );
      const data = await res.json();
      if (data.success) {
        setBooking({ ...booking, status: "cancelled", payment_status: "cancelled" });
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } finally {
      setCancelling(false);
    }
  }

  // Self-service cancel is only offered while payment is still pending -
  // once paid/confirmed, the guest needs to contact the hotel directly.
  const canCancel = booking && booking.status === "confirmed" && booking.payment_status === "pending";

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <SiteHeader />

      <div className="mx-auto max-w-lg px-6 py-20">
        <h1 className="text-center text-3xl font-bold text-[var(--text-primary)]">
          Find My Booking
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Enter your booking reference and the email you booked with.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex flex-col gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6"
        >
          <label className="text-sm text-[var(--text-secondary)]">
            Booking Reference
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="MTX-XXXXXX"
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            />
          </label>

          <label className="text-sm text-[var(--text-secondary)]">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            />
          </label>

          <button
            type="submit"
            disabled={status === "searching"}
            className="rounded-full bg-[var(--accent-color)] px-6 py-2.5 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {status === "searching" ? "Searching…" : "Find Booking"}
          </button>

          {status === "error" && <p className="text-center text-sm text-red-400">{message}</p>}
        </form>

        {booking && (
          <div className="mt-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-lg font-bold text-[var(--accent-color)]">
                {booking.booking_reference}
              </p>
              <div className="flex gap-2">
                <Badge value={booking.status} styles={STATUS_STYLES} />
                <Badge value={booking.payment_status} styles={PAYMENT_STYLES} />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm text-[var(--text-secondary)]">
              <div className="flex justify-between">
                <span>Guest</span>
                <span className="text-[var(--text-primary)]">{booking.guest_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Room</span>
                <span className="text-[var(--text-primary)]">
                  {booking.rooms.length}x {booking.rooms[0]?.room_type}
                </span>
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
              <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-base font-bold">
                <span className="text-[var(--text-primary)]">Total</span>
                <span className="text-[var(--text-primary)]">
                  {formatPrice(booking.total_amount, currency)}
                </span>
              </div>
            </div>

            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="mt-6 w-full rounded-full border border-[var(--border-color)] px-6 py-2.5 font-medium text-[var(--text-secondary)] transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-50"
              >
                {cancelling ? "Cancelling…" : "Cancel Booking"}
              </button>
            )}

            {booking.status === "confirmed" && booking.payment_status === "paid" && (
              <p className="mt-4 text-center text-xs text-[var(--text-secondary)]">
                This booking is already paid. Contact the hotel directly to modify or cancel it.
              </p>
            )}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
