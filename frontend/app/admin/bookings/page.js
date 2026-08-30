"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";

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

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function loadBookings() {
    try {
      const res = await adminFetch("/api/admin/bookings");
      const data = await res.json();
      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.message || "Failed to load bookings.");
      }
    } catch {
      // adminFetch already redirects to login on 401; anything else is a
      // network hiccup, surfaced via the error state below.
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleCancel(id) {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      const res = await adminFetch(`/api/admin/bookings/${id}/cancel`, { method: "PATCH" });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      } else {
        alert(data.message || "Failed to cancel booking.");
      }
    } finally {
      setCancellingId(null);
    }
  }

  if (bookings === null && !error) {
    return <p className="text-[var(--text-secondary)]">Loading bookings…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bookings</h1>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {bookings && bookings.length === 0 && (
        <p className="mt-6 text-[var(--text-secondary)]">No bookings yet.</p>
      )}

      {bookings && bookings.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Check-out</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-mono">{b.booking_reference}</td>
                  <td className="px-4 py-3">
                    <div>{b.guest_name}</div>
                    <div className="text-xs text-[var(--text-secondary)]">{b.guest_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {b.room_type} — {b.room_number}
                  </td>
                  <td className="px-4 py-3">{b.check_in_date}</td>
                  <td className="px-4 py-3">{b.check_out_date}</td>
                  <td className="px-4 py-3">
                    <Badge value={b.status} styles={STATUS_STYLES} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={b.payment_status} styles={PAYMENT_STYLES} />
                  </td>
                  <td className="px-4 py-3">
                    {b.status !== "cancelled" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                      >
                        {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
