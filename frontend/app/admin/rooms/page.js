"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];
const ROOM_STATUSES = ["Available", "Occupied", "Maintenance"];
const STATUS_STYLES = {
  Available: "bg-emerald-500/10 text-emerald-400",
  Occupied: "bg-amber-500/10 text-amber-400",
  Maintenance: "bg-red-500/10 text-red-400",
};

const EMPTY_FORM = { room_number: "", room_type: "Standard", price_per_night: "", capacity: "" };

function RoomForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="text-sm text-[var(--text-secondary)]">
        Room #
        <input
          type="text"
          value={form.room_number}
          onChange={(e) => setForm({ ...form, room_number: e.target.value })}
          required
          className="mt-1 block w-24 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </label>

      <label className="text-sm text-[var(--text-secondary)]">
        Type
        <select
          value={form.room_type}
          onChange={(e) => setForm({ ...form, room_type: e.target.value })}
          className="mt-1 block rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        >
          {ROOM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm text-[var(--text-secondary)]">
        Price/night
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price_per_night}
          onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
          required
          className="mt-1 block w-28 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </label>

      <label className="text-sm text-[var(--text-secondary)]">
        Capacity
        <input
          type="number"
          min="1"
          value={form.capacity}
          onChange={(e) => setForm({ ...form, capacity: e.target.value })}
          required
          className="mt-1 block w-20 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
      >
        {saving ? "Saving…" : submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-[var(--border-color)] px-4 py-1.5 text-sm text-[var(--text-secondary)]"
        >
          Cancel
        </button>
      )}
      {error && <p className="w-full text-sm text-red-400">{error}</p>}
    </form>
  );
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  async function loadRooms() {
    try {
      const res = await fetch(`${API_URL}/api/rooms`);
      const data = await res.json();
      if (data.success) setRooms(data.data);
    } catch {
      setError("Failed to load rooms.");
    }
  }

  useEffect(() => {
    loadRooms();
  }, []);

  async function handleCreate(form) {
    const res = await adminFetch("/api/admin/rooms", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    await loadRooms();
  }

  async function handleUpdate(id, form) {
    const res = await adminFetch(`/api/admin/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    setEditingId(null);
    await loadRooms();
  }

  async function handleStatusChange(id, status) {
    setStatusUpdatingId(id);
    try {
      const res = await adminFetch(`/api/admin/rooms/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      } else {
        alert(data.message || "Failed to update status.");
      }
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this room? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await adminFetch(`/api/admin/rooms/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await loadRooms();
      } else {
        alert(data.message || "Failed to delete room.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  if (rooms === null && !error) {
    return <p className="text-[var(--text-secondary)]">Loading rooms…</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Rooms</h1>

      <div className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">Add a room</h2>
        <RoomForm initial={EMPTY_FORM} onSubmit={handleCreate} submitLabel="Add Room" />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {rooms && rooms.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-4 py-3 font-medium">Room #</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price/night</th>
                <th className="px-4 py-3 font-medium">Capacity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
              {rooms.map((room) =>
                editingId === room.id ? (
                  <tr key={room.id}>
                    <td colSpan={6} className="px-4 py-3">
                      <RoomForm
                        initial={{
                          room_number: room.room_number,
                          room_type: room.room_type,
                          price_per_night: room.price_per_night,
                          capacity: room.capacity,
                        }}
                        onSubmit={(form) => handleUpdate(room.id, form)}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save"
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={room.id}>
                    <td className="px-4 py-3">{room.room_number}</td>
                    <td className="px-4 py-3">{room.room_type}</td>
                    <td className="px-4 py-3">₱{Number(room.price_per_night).toLocaleString()}</td>
                    <td className="px-4 py-3">{room.capacity}</td>
                    <td className="px-4 py-3">
                      <select
                        value={room.status || "Available"}
                        onChange={(e) => handleStatusChange(room.id, e.target.value)}
                        disabled={statusUpdatingId === room.id}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none disabled:opacity-50 ${
                          STATUS_STYLES[room.status] || STATUS_STYLES.Available
                        }`}
                      >
                        {ROOM_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(room.id)}
                          className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(room.id)}
                          disabled={deletingId === room.id}
                          className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-red-400 hover:text-red-400 disabled:opacity-50"
                        >
                          {deletingId === room.id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
