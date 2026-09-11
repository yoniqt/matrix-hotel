"use client";

import { useEffect, useRef, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";
import ConfirmDialog from "../ui/confirm-dialog";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Family"];

function RoomTypePhotoCard({ type, photos, onUpload, onDeleteRequest }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      await onUpload(type, file);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{type} Room</h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full bg-[var(--accent-color)] px-4 py-1.5 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "+ Add Photo"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {photos.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          No uploaded photos yet - the public site is showing its bundled default gallery for this type.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="w-40">
              <div className="h-32 w-40 overflow-hidden rounded-lg border border-[var(--border-color)]">
                <img src={photo.url} alt={`${type} room`} className="h-full w-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => onDeleteRequest(photo.id)}
                className="mt-2 w-full rounded-full border border-[var(--border-color)] py-1 text-xs font-medium text-red-400 hover:border-red-400 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}

export default function AdminPhotosPage() {
  const [photosByType, setPhotosByType] = useState(null);
  const [roomTypes, setRoomTypes] = useState(ROOM_TYPES);
  const [error, setError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  async function loadPhotos() {
    try {
      const res = await fetch(`${API_URL}/api/room-types/photos`);
      const data = await res.json();
      if (data.success) setPhotosByType(data.data);
    } catch {
      setError("Failed to load photos.");
    }
  }

  // Room types aren't a fixed list - the admin can create a new one just
  // by naming it on a room. Pull in whatever types actually exist so a
  // newly-added type gets a photo-upload card too, not just the 4 defaults.
  async function loadRoomTypes() {
    try {
      const res = await fetch(`${API_URL}/api/rooms`);
      const data = await res.json();
      if (data.success) {
        const types = new Set([...ROOM_TYPES, ...data.data.map((r) => r.room_type)]);
        setRoomTypes(Array.from(types));
      }
    } catch {
      // Falls back to the 4 defaults already in state.
    }
  }

  useEffect(() => {
    loadPhotos();
    loadRoomTypes();
  }, []);

  async function handleUpload(type, file) {
    const formData = new FormData();
    formData.append("photo", file);
    const res = await adminFetch(`/api/admin/room-types/${type}/photos`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message);
    await loadPhotos();
  }

  async function handleDelete(id) {
    setConfirmDeleteId(null);
    const res = await adminFetch(`/api/admin/room-type-photos/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      await loadPhotos();
    } else {
      alert(data.message || "Failed to delete photo.");
    }
  }

  if (photosByType === null && !error) {
    return <p className="text-[var(--text-secondary)]">Loading photos…</p>;
  }

  return (
    <div>
      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete this photo?"
        message="This cannot be undone."
        confirmLabel="Delete Photo"
        onConfirm={() => handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Room Photos</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Photos here apply to every room of that type across the whole site.
      </p>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      <div className="mt-6 flex flex-col gap-6">
        {roomTypes.map((type) => (
          <RoomTypePhotoCard
            key={type}
            type={type}
            photos={photosByType?.[type] || []}
            onUpload={handleUpload}
            onDeleteRequest={setConfirmDeleteId}
          />
        ))}
      </div>
    </div>
  );
}
