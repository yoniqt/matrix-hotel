"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";

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

const EMPTY_WALKIN_FORM = {
  name: "",
  email: "",
  phone: "",
  room_id: "",
  check_in_date: "",
  check_out_date: "",
  special_requests: "",
  payment_status: "paid",
};

function WalkInForm({ rooms, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY_WALKIN_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({ ...form, room_id: Number(form.room_id) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4"
    >
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">
        New walk-in booking
      </h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm text-[var(--text-secondary)]">
          Guest name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="mt-1 block w-40 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="mt-1 block w-48 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Phone
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
            className="mt-1 block w-36 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Room
          <select
            value={form.room_id}
            onChange={(e) => setForm({ ...form, room_id: e.target.value })}
            required
            className="mt-1 block w-40 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          >
            <option value="" disabled>
              Select room
            </option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.room_type} — {r.room_number}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Check-in
          <input
            type="date"
            value={form.check_in_date}
            onChange={(e) => setForm({ ...form, check_in_date: e.target.value })}
            required
            className="mt-1 block rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Check-out
          <input
            type="date"
            value={form.check_out_date}
            onChange={(e) => setForm({ ...form, check_out_date: e.target.value })}
            required
            className="mt-1 block rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Payment
          <select
            value={form.payment_status}
            onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
            className="mt-1 block rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </label>

        <label className="flex-1 text-sm text-[var(--text-secondary)]" style={{ minWidth: "12rem" }}>
          Special requests
          <input
            type="text"
            value={form.special_requests}
            onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create Booking"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[var(--border-color)] px-4 py-1.5 text-sm text-[var(--text-secondary)]"
        >
          Cancel
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </form>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);

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

  async function loadRooms() {
    try {
      const res = await fetch(`${API_URL}/api/rooms`);
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch {
      // Room dropdown just stays empty if this fails - not worth a
      // separate error state on top of the bookings one.
    }
  }

  useEffect(() => {
    loadBookings();
    loadRooms();
  }, []);

  async function handleCreateWalkIn(form) {
    const res = await adminFetch("/api/admin/bookings", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setShowWalkInForm(false);
    await loadBookings();
  }

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Bookings</h1>
        {!showWalkInForm && (
          <button
            type="button"
            onClick={() => setShowWalkInForm(true)}
            className="rounded-full bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            + New Walk-in Booking
          </button>
        )}
      </div>

      {showWalkInForm && (
        <WalkInForm
          rooms={rooms}
          onSubmit={handleCreateWalkIn}
          onCancel={() => setShowWalkInForm(false)}
        />
      )}

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
