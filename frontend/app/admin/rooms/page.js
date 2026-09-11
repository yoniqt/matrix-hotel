"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import ConfirmDialog from "../ui/confirm-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];
const ROOM_STATUSES = ["Available", "Occupied", "Maintenance"];
const STATUS_STYLES = {
  Available: "bg-emerald-500/10 text-emerald-400",
  Occupied: "bg-amber-500/10 text-amber-400",
  Maintenance: "bg-red-500/10 text-red-400",
};

const EMPTY_FORM = { room_number: "", room_type: "Standard", price_per_night: "", capacity: "" };
const ADD_NEW_TYPE_VALUE = "__add_new__";

// A <select> of existing room types plus a "+ Add new type..." option that
// swaps in a text input for naming a brand new one. Once that room is
// saved, the new type shows up as a normal option here next time (the
// caller recomputes existingTypes from the live room list).
function RoomTypeField({ value, options, onChange, formId }) {
  const [addingNew, setAddingNew] = useState(false);

  function handleSelectChange(e) {
    if (e.target.value === ADD_NEW_TYPE_VALUE) {
      setAddingNew(true);
      onChange("");
    } else {
      onChange(e.target.value);
    }
  }

  if (addingNew) {
    return (
      <div className="mt-1 flex gap-2">
        <input
          form={formId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoFocus
          placeholder="New room type name"
          className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
        <button
          type="button"
          onClick={() => {
            setAddingNew(false);
            onChange(options[0] || "");
          }}
          className="shrink-0 rounded-lg border border-[var(--border-color)] px-2 py-1.5 text-xs text-[var(--text-secondary)]"
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <select
      form={formId}
      value={value}
      onChange={handleSelectChange}
      className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
      <option value={ADD_NEW_TYPE_VALUE}>+ Add new type...</option>
    </select>
  );
}

function RoomForm({ initial, existingTypes, onSubmit, onCancel, submitLabel }) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="text-sm text-[var(--text-secondary)]">
        Room #
        <input
          type="text"
          value={form.room_number}
          onChange={(e) => setForm({ ...form, room_number: e.target.value })}
          required
          className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </label>

      <label className="text-sm text-[var(--text-secondary)]">
        Type
        <RoomTypeField
          value={form.room_type}
          options={existingTypes || ROOM_TYPES}
          onChange={(room_type) => setForm({ ...form, room_type })}
        />
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
          className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
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
          className="mt-1 block w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="mt-2 flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[var(--border-color)] px-4 py-1.5 text-sm text-[var(--text-secondary)]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

// Renders as actual <td> cells lined up under the table's own columns,
// instead of one colSpan cell with a flex-wrap form (which bunched every
// field against the left edge instead of under its header).
function EditRoomRow({ room, existingTypes, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    room_number: room.room_number,
    room_type: room.room_type,
    price_per_night: room.price_per_night,
    capacity: room.capacity,
  });
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
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-2 py-1.5 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]";

  return (
    <>
      <tr>
        <td className="px-4 py-3">
          <input
            form={`edit-room-${room.id}`}
            type="text"
            value={form.room_number}
            onChange={(e) => setForm({ ...form, room_number: e.target.value })}
            required
            className={inputClass}
          />
        </td>
        <td className="px-4 py-3">
          <RoomTypeField
            formId={`edit-room-${room.id}`}
            value={form.room_type}
            options={existingTypes || ROOM_TYPES}
            onChange={(room_type) => setForm({ ...form, room_type })}
          />
        </td>
        <td className="px-4 py-3">
          <input
            form={`edit-room-${room.id}`}
            type="number"
            min="0"
            step="0.01"
            value={form.price_per_night}
            onChange={(e) => setForm({ ...form, price_per_night: e.target.value })}
            required
            className={inputClass}
          />
        </td>
        <td className="px-4 py-3">
          <input
            form={`edit-room-${room.id}`}
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            required
            className={inputClass}
          />
        </td>
        <td className="px-4 py-3 text-[var(--text-secondary)]">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[room.status] || STATUS_STYLES.Available}`}>
            {room.status || "Available"}
          </span>
        </td>
        <td className="px-4 py-3">
          <form
            id={`edit-room-${room.id}`}
            onSubmit={handleSubmit}
            className="flex gap-2"
          >
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[var(--accent-color)] px-3 py-1 text-xs font-semibold text-black hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs text-[var(--text-secondary)]"
            >
              Cancel
            </button>
          </form>
        </td>
      </tr>
      {error && (
        <tr>
          <td colSpan={6} className="px-4 pb-3 text-sm text-red-400">
            {error}
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Union of the 4 defaults and whatever types actually exist in the data,
  // so the datalist suggests real types while still letting the admin type
  // a brand new one that isn't in either list yet.
  const existingTypes = Array.from(
    new Set([...ROOM_TYPES, ...(rooms || []).map((r) => r.room_type)])
  );

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
    setShowAddForm(false);
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
    setConfirmDeleteId(null);
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
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete this room?"
        message="This cannot be undone."
        confirmLabel="Delete Room"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Rooms</h1>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="rounded-full bg-[var(--accent-color)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            + Add Room
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6">
            <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">Add a room</h2>
            <RoomForm
              initial={EMPTY_FORM}
              existingTypes={existingTypes}
              onSubmit={handleCreate}
              onCancel={() => setShowAddForm(false)}
              submitLabel="Add Room"
            />
          </div>
        </div>
      )}

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
                  <EditRoomRow
                    key={room.id}
                    room={room}
                    existingTypes={existingTypes}
                    onSubmit={(form) => handleUpdate(room.id, form)}
                    onCancel={() => setEditingId(null)}
                  />
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
                          onClick={() => setConfirmDeleteId(room.id)}
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
