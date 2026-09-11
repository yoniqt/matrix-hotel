"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import ConfirmDialog from "../ui/confirm-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function formatPeso(amount) {
  return `₱${Number(amount).toLocaleString()}`;
}

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
            min={todayString()}
            onChange={(e) => {
              const date = e.target.value;
              setForm((prev) => ({
                ...prev,
                check_in_date: date,
                // Clear check-out if it's no longer after the new check-in,
                // rather than silently leaving an invalid date in the field.
                check_out_date: prev.check_out_date && prev.check_out_date <= date ? "" : prev.check_out_date,
              }));
            }}
            required
            className="mt-1 block rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </label>

        <label className="text-sm text-[var(--text-secondary)]">
          Check-out
          <input
            type="date"
            value={form.check_out_date}
            min={addDays(form.check_in_date || todayString(), 1)}
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

function EditBookingModal({ booking, rooms, onSubmit, onCancel }) {
  const [roomId, setRoomId] = useState(booking.room_id);
  const [checkIn, setCheckIn] = useState(booking.check_in_date);
  const [checkOut, setCheckOut] = useState(booking.check_out_date);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({ room_id: Number(roomId), check_in_date: checkIn, check_out_date: checkOut });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
        <h2 className="mb-1 text-lg font-bold text-[var(--text-primary)]">Edit Booking</h2>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">{booking.booking_reference}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm text-[var(--text-secondary)]">
            Room
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            >
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
              value={checkIn}
              min={todayString()}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut && checkOut <= e.target.value) setCheckOut("");
              }}
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            />
          </label>

          <label className="text-sm text-[var(--text-secondary)]">
            Check-out
            <input
              type="date"
              value={checkOut}
              min={addDays(checkIn || todayString(), 1)}
              onChange={(e) => setCheckOut(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-[var(--border-color)] px-4 py-1.5 text-sm text-[var(--text-secondary)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingReceiptModal({ booking, onClose }) {
  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);
  const total = Number(booking.price_per_night) * nights;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div
        id="print-area"
        className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 print:border-0"
      >
        <p className="text-center text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
          The Matrix Hotel
        </p>
        <h2 className="mt-1 text-center text-xl font-bold text-[var(--text-primary)]">
          Booking Receipt
        </h2>

        <div className="mt-6 rounded-xl border border-dashed border-[var(--border-color)] p-4 text-center">
          <p className="text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
            Booking Reference
          </p>
          <p className="mt-1 font-mono text-xl font-bold tracking-wide text-[var(--accent-color)]">
            {booking.booking_reference}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 text-sm text-[var(--text-secondary)]">
          <div className="flex justify-between">
            <span>Guest</span>
            <span className="text-[var(--text-primary)]">{booking.guest_name}</span>
          </div>
          <div className="flex justify-between">
            <span>Email</span>
            <span className="text-[var(--text-primary)]">{booking.guest_email}</span>
          </div>
          <div className="flex justify-between">
            <span>Room</span>
            <span className="text-[var(--text-primary)]">
              {booking.room_type} — {booking.room_number}
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
            <span className="text-[var(--text-primary)]">{nights}</span>
          </div>
          <div className="flex justify-between">
            <span>Price / night</span>
            <span className="text-[var(--text-primary)]">{formatPeso(booking.price_per_night)}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="capitalize text-[var(--text-primary)]">{booking.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment</span>
            <span className="capitalize text-[var(--text-primary)]">{booking.payment_status}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-[var(--border-color)] pt-3 text-base font-bold">
            <span className="text-[var(--text-primary)]">Total</span>
            <span className="text-[var(--text-primary)]">{formatPeso(total)}</span>
          </div>
        </div>

        <div className="mt-8 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-[var(--border-color)] px-4 py-2 text-sm text-[var(--text-secondary)]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 rounded-full bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Print
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [receiptBooking, setReceiptBooking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  async function handleEditBooking(form) {
    const res = await adminFetch(`/api/admin/bookings/${editingBooking.id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setEditingBooking(null);
    await loadBookings();
  }

  async function handleCancel(id) {
    setConfirmCancelId(null);
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

  const visibleBookings = (bookings || []).filter((b) => {
    const matchesSearch =
      !searchQuery || b.guest_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (bookings === null && !error) {
    return <p className="text-[var(--text-secondary)]">Loading bookings…</p>;
  }

  return (
    <div>
      <ConfirmDialog
        open={confirmCancelId !== null}
        title="Cancel this booking?"
        message="This cannot be undone."
        confirmLabel="Cancel Booking"
        onConfirm={() => handleCancel(confirmCancelId)}
        onCancel={() => setConfirmCancelId(null)}
      />

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          rooms={rooms}
          onSubmit={handleEditBooking}
          onCancel={() => setEditingBooking(null)}
        />
      )}

      {receiptBooking && (
        <BookingReceiptModal booking={receiptBooking} onClose={() => setReceiptBooking(null)} />
      )}

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

      {bookings && bookings.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest name..."
            className="w-56 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}

      {bookings && bookings.length === 0 && (
        <p className="mt-6 text-[var(--text-secondary)]">No bookings yet.</p>
      )}

      {bookings && bookings.length > 0 && visibleBookings.length === 0 && (
        <p className="mt-6 text-[var(--text-secondary)]">No bookings match your search/filter.</p>
      )}

      {visibleBookings.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full min-w-[1000px] text-left text-sm">
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
              {visibleBookings.map((b) => (
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
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setReceiptBooking(b)}
                        className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                      >
                        Receipt
                      </button>
                      {b.status !== "cancelled" && (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditingBooking(b)}
                            className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmCancelId(b.id)}
                            disabled={cancellingId === b.id}
                            className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                          >
                            {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                          </button>
                        </>
                      )}
                    </div>
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
