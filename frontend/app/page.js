"use client";

import { useState } from "react";
import DatePicker from "./ui/date-picker";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const ROOM_TYPE_IMAGES = {
  Standard: "https://picsum.photos/seed/room-standard/600/400",
  Deluxe: "https://picsum.photos/seed/room-deluxe/600/400",
  Suite: "https://picsum.photos/seed/room-suite/600/400",
};

function roomImage(room) {
  return (
    ROOM_TYPE_IMAGES[room.room_type] ||
    `https://picsum.photos/seed/room-${room.id}/600/400`
  );
}

export default function Home() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [openPicker, setOpenPicker] = useState(null); // "checkin" | "checkout" | null
  const [rooms, setRooms] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchMessage, setSearchMessage] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    special_requests: "",
  });
  const [bookingStatus, setBookingStatus] = useState("idle");
  const [bookingMessage, setBookingMessage] = useState("");

  async function handleSearch(e) {
    e.preventDefault();

    if (!checkIn || !checkOut) {
      setSearchStatus("error");
      setSearchMessage("Please select both check-in and check-out dates.");
      return;
    }

    setSearchStatus("searching");
    setSearchMessage("");
    setRooms(null);

    try {
      const res = await fetch(
        `${API_URL}/api/rooms/available?check_in=${checkIn}&check_out=${checkOut}`
      );
      const data = await res.json();

      if (!data.success) {
        setSearchStatus("error");
        setSearchMessage(data.message);
        return;
      }

      setRooms(data.data);
      setSearchStatus("done");
    } catch {
      setSearchStatus("error");
      setSearchMessage("Could not reach the server. Is the backend running?");
    }
  }

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingStatus("sending");
    setBookingMessage("");

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          room_id: selectedRoom.id,
          check_in_date: checkIn,
          check_out_date: checkOut,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setBookingStatus("error");
        setBookingMessage(data.message);
        return;
      }

      setBookingStatus("success");
      setBookingMessage("Booking confirmed!");
      setForm({ name: "", email: "", phone: "", special_requests: "" });
      setRooms((prev) => prev.filter((r) => r.id !== selectedRoom.id));
      setSelectedRoom(null);
    } catch {
      setBookingStatus("error");
      setBookingMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="relative flex min-h-[520px] flex-col">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://picsum.photos/seed/tropical-resort-pool/1600/900')",
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        <nav className="relative z-10 flex items-center justify-between px-8 py-6 text-white">
          <span className="text-xl font-semibold italic">The Matrix Hotel</span>
          <div className="hidden gap-8 text-sm font-medium sm:flex">
            <span>Home</span>
            <span>About</span>
            <span>Rooms</span>
            <span>Contact</span>
          </div>
        </nav>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-sm font-semibold tracking-widest uppercase text-amber-300">
            Get luxury and comfort
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">
            Discover Your Perfect Stay at The Matrix Hotel
          </h1>
        </div>

        {/* Search widget, overlapping the bottom of the hero */}
        <form
          onSubmit={handleSearch}
          className="relative z-10 mx-auto -mb-10 flex w-full max-w-3xl flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <DatePicker
              label="Check-in"
              value={checkIn}
              onChange={setCheckIn}
              minDate={todayString()}
              open={openPicker === "checkin"}
              onOpenChange={(next) => setOpenPicker(next ? "checkin" : null)}
            />
          </div>
          <div className="flex-1">
            <DatePicker
              label="Check-out"
              value={checkOut}
              onChange={setCheckOut}
              minDate={checkIn || todayString()}
              open={openPicker === "checkout"}
              onOpenChange={(next) => setOpenPicker(next ? "checkout" : null)}
            />
          </div>
          <button
            type="submit"
            disabled={searchStatus === "searching"}
            className="rounded-lg bg-amber-500 px-8 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {searchStatus === "searching" ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-5xl px-6 pt-20 pb-16">
        {searchStatus === "idle" && (
          <p className="text-center text-zinc-500">
            Pick your check-in and check-out dates above to see available rooms.
          </p>
        )}
        {searchStatus === "error" && (
          <p className="text-center text-red-600">{searchMessage}</p>
        )}
        {rooms && rooms.length === 0 && (
          <p className="text-center text-zinc-500">
            No rooms available for those dates. Try different dates.
          </p>
        )}

        {rooms && rooms.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <img
                  src={roomImage(room)}
                  alt={`Room ${room.room_number}`}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-lg font-semibold">
                    Room {room.room_number} — {room.room_type}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Up to {room.capacity} guests
                  </p>
                  <p className="mt-2 text-lg font-bold">
                    ₱{Number(room.price_per_night).toLocaleString()}{" "}
                    <span className="text-sm font-normal text-zinc-500">
                      / night
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setBookingStatus("idle");
                      setBookingMessage("");
                    }}
                    className="mt-4 w-full rounded-full bg-black px-5 py-2 font-medium text-white"
                  >
                    Book this room
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking form modal-ish section */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Book Room {selectedRoom.room_number}
              </h2>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-2xl leading-none text-zinc-400"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {checkIn} to {checkOut}
            </p>

            <form
              onSubmit={handleBookingSubmit}
              className="mt-4 flex flex-col gap-4"
            >
              <input
                required
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-zinc-300 px-4 py-2"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-zinc-300 px-4 py-2"
              />
              <input
                required
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-zinc-300 px-4 py-2"
              />
              <textarea
                placeholder="Special requests (optional)"
                value={form.special_requests}
                onChange={(e) =>
                  setForm({ ...form, special_requests: e.target.value })
                }
                className="rounded-lg border border-zinc-300 px-4 py-2"
              />

              <button
                type="submit"
                disabled={bookingStatus === "sending"}
                className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
              >
                {bookingStatus === "sending" ? "Booking..." : "Confirm booking"}
              </button>

              {bookingMessage && (
                <p
                  className={
                    bookingStatus === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {bookingMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
