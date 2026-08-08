"use client";

import { useState } from "react";
import DatePicker from "./ui/date-picker";
import HeroCarousel from "./ui/hero-carousel";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

const ROOM_TYPE_IMAGES = {
  Standard: "/images/rooms/standard.webp",
  Deluxe: "/images/rooms/deluxe.webp",
  Suite: "/images/rooms/suite.jpg",
  Family: "/images/rooms/family.jpg",
};

function roomImage(room) {
  return ROOM_TYPE_IMAGES[room.room_type] || "/images/rooms/standard.webp";
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
      {/* Top contact bar */}
      <div className="flex items-center justify-between bg-zinc-900 px-8 py-2 text-xs text-zinc-300">
        <div className="flex items-center gap-4">
          <span>📞 +63 900 000 0000</span>
          <span className="hidden sm:inline">✉️ stay@thematrixhotel.com</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Contact Us</span>
          <span>🇬🇧 English</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative flex min-h-[520px] flex-col">
        <HeroCarousel />
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

      {/* Showcase - always visible, fills the page before anyone searches.
          Rooms are intentionally NOT shown here - they only appear after a
          date search, so this section is purely about hotel amenities. */}
      {searchStatus === "idle" && (
        <div className="mx-auto max-w-5xl px-6 pt-24 pb-4">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                🏊
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-900">
                Infinity Pool
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Relax by our rooftop infinity pool with a stunning city view.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                🏋️
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-900">
                Fitness Gym
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Fully equipped 24-hour gym for guests at any time of day.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
                🍸
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-900">
                Rooftop Bar
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Handcrafted cocktails and city views, open every evening.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <img
                src="/images/amenities/gym.jpg"
                alt="Hotel gym"
                className="h-44 w-full object-cover"
              />
              <p className="p-4 text-center text-lg font-semibold text-zinc-900">
                Gym
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <img
                src="/images/amenities/pool.jpg"
                alt="Hotel pool"
                className="h-44 w-full object-cover"
              />
              <p className="p-4 text-center text-lg font-semibold text-zinc-900">
                Pool
              </p>
            </div>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
              <img
                src="/images/amenities/bar.jpg"
                alt="Hotel bar"
                className="h-44 w-full object-cover"
              />
              <p className="p-4 text-center text-lg font-semibold text-zinc-900">
                Bar
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mx-auto max-w-5xl px-6 pt-16 pb-16">
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
