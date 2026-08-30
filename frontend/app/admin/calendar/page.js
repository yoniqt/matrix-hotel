"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "../../../lib/admin-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return formatDateStr(date);
}

function todayStr() {
  return formatDateStr(new Date());
}

const STATUS_COLORS = {
  paid: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

export default function AdminCalendarPage() {
  const [rooms, setRooms] = useState(null);
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState(todayStr());
  const [dayCount, setDayCount] = useState(14);

  useEffect(() => {
    async function load() {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          fetch(`${API_URL}/api/rooms`),
          adminFetch("/api/admin/bookings"),
        ]);
        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();

        if (roomsData.success) setRooms(roomsData.data);
        if (bookingsData.success) {
          setBookings(bookingsData.data.filter((b) => b.status !== "cancelled"));
        } else {
          setError(bookingsData.message || "Failed to load bookings.");
        }
      } catch {
        // adminFetch already redirects to login on 401.
      }
    }
    load();
  }, []);

  const dates = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => addDays(startDate, i)),
    [startDate, dayCount]
  );

  // room_id -> date string -> booking, so each grid cell is an O(1) lookup
  // instead of scanning every booking per cell.
  const occupancy = useMemo(() => {
    const map = new Map();
    if (!bookings) return map;
    for (const b of bookings) {
      if (!map.has(b.room_id)) map.set(b.room_id, new Map());
      const roomMap = map.get(b.room_id);
      let d = b.check_in_date;
      while (d < b.check_out_date) {
        roomMap.set(d, b);
        d = addDays(d, 1);
      }
    }
    return map;
  }, [bookings]);

  if (rooms === null && !error) {
    return <p className="text-[var(--text-secondary)]">Loading calendar…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Booking Calendar</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStartDate((d) => addDays(d, -dayCount))}
            className="rounded-full border border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={() => setStartDate(todayStr())}
            className="rounded-full border border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setStartDate((d) => addDays(d, dayCount))}
            className="rounded-full border border-[var(--border-color)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            Next →
          </button>
          <select
            value={dayCount}
            onChange={(e) => setDayCount(Number(e.target.value))}
            className="rounded-full border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex gap-4 text-xs text-[var(--text-secondary)]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-emerald-500/40 bg-emerald-500/20" /> Paid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-amber-500/40 bg-amber-500/20" /> Awaiting payment
        </span>
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {rooms && rooms.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[var(--border-color)]">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)]">
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 font-medium">
                  Room
                </th>
                {dates.map((d) => {
                  const dateObj = new Date(`${d}T00:00:00`);
                  const isToday = d === todayStr();
                  return (
                    <th
                      key={d}
                      className={`min-w-[64px] border-b border-r border-[var(--border-color)] px-2 py-2 text-center font-medium ${
                        isToday ? "bg-[var(--border-color)] text-[var(--accent-color)]" : ""
                      }`}
                    >
                      <div>{DAY_LABELS[dateObj.getDay()]}</div>
                      <div>{dateObj.getDate()}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id} className="border-b border-[var(--border-color)]">
                  <td className="sticky left-0 z-10 border-r border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 font-medium text-[var(--text-primary)]">
                    <div>{room.room_number}</div>
                    <div className="text-[var(--text-secondary)]">{room.room_type}</div>
                  </td>
                  {dates.map((d) => {
                    const booking = occupancy.get(room.id)?.get(d);
                    return (
                      <td
                        key={d}
                        title={
                          booking
                            ? `${booking.guest_name} — ${booking.booking_reference} (${booking.payment_status})`
                            : ""
                        }
                        className={`border-r border-[var(--border-color)] px-1.5 py-2 text-center ${
                          booking
                            ? `border-x ${STATUS_COLORS[booking.payment_status] || "bg-zinc-500/20 text-zinc-300"}`
                            : ""
                        }`}
                      >
                        {booking ? booking.guest_name.split(" ")[0] : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
