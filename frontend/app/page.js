"use client";

import { useState } from "react";
import DatePicker from "./ui/date-picker";
import HeroCarousel from "./ui/hero-carousel";
import Footer from "./ui/footer";

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

const ROOM_TYPE_DESCRIPTIONS = {
  Standard: "A cozy, comfortable room with everything you need for a relaxing stay - perfect for solo travelers or couples.",
  Deluxe: "A more spacious room with upgraded furnishings and a better view, ideal for guests wanting extra comfort.",
  Suite: "A generous suite with a separate living area, perfect for longer stays or small families who want more room to unwind.",
  Family: "Our largest room, built for bigger groups and families - plenty of space and beds for everyone to stay together.",
};

// Groups individual physical rooms (Room 101, Room 102, ...) into one card
// per room TYPE, since guests book a type of room, not a specific numbered
// room - two identical Standard rooms don't need two separate listings.
function groupRoomsByType(rooms) {
  const groups = new Map();
  for (const room of rooms) {
    if (!groups.has(room.room_type)) {
      groups.set(room.room_type, { ...room, availableCount: 0, roomIds: [] });
    }
    const group = groups.get(room.room_type);
    group.availableCount += 1;
    group.roomIds.push(room.id);
  }
  return Array.from(groups.values());
}

const AMENITIES = [
  {
    key: "gym",
    name: "Gym",
    image: "/images/amenities/gym.jpg",
    hours: "8:00 AM – 5:00 PM",
    note: null,
    location: "2nd Floor",
    description:
      "State-of-the-art fitness equipment with floor-to-ceiling views.",
    features: [
      "Free weights & cardio machines",
      "Personal trainers available on request",
      "Fresh towels provided",
    ],
  },
  {
    key: "pool",
    name: "Pool",
    image: "/images/amenities/pool.jpg",
    hours: "8:00 AM – 11:00 PM",
    note: null,
    location: "Rooftop, 15th Floor",
    description: "Unwind at our rooftop infinity pool overlooking the city.",
    features: [
      "Heated year-round",
      "Poolside food & drink service",
      "Kids' hours: 8:00 AM – 6:00 PM",
    ],
  },
  {
    key: "bar",
    name: "Bar",
    image: "/images/amenities/bar.jpg",
    hours: "6:00 PM – 12:00 AM",
    note: "Happy Hour: 8:00 PM – 10:00 PM",
    location: "Rooftop, 16th Floor",
    description: "Handcrafted cocktails and skyline views after dark.",
    features: [
      "Live music on weekends",
      "Smart casual dress code",
      "Reservations recommended",
    ],
  },
];

export default function Home() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [openPicker, setOpenPicker] = useState(null); // "checkin" | "checkout" | null
  const [rooms, setRooms] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchMessage, setSearchMessage] = useState("");

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingStep, setBookingStep] = useState("quantity"); // "quantity" | "details"
  const [quantity, setQuantity] = useState(1);
  const [adults, setAdults] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    special_requests: "",
  });
  const [bookingStatus, setBookingStatus] = useState("idle");
  const [bookingMessage, setBookingMessage] = useState("");
  const [selectedAmenity, setSelectedAmenity] = useState(null);

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

    // Book one room at a time from this room-type's available room IDs,
    // since each physical room needs its own booking record. If any single
    // one fails (e.g. someone else just took it), stop and report it.
    const roomIdsToBook = selectedRoom.roomIds.slice(0, quantity);

    try {
      for (const roomId of roomIdsToBook) {
        const res = await fetch(`${API_URL}/api/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            room_id: roomId,
            check_in_date: checkIn,
            check_out_date: checkOut,
            guests_count: adults,
          }),
        });
        const data = await res.json();

        if (!data.success) {
          setBookingStatus("error");
          setBookingMessage(data.message);
          return;
        }
      }

      setBookingStatus("success");
      setBookingMessage(
        `${roomIdsToBook.length} room${roomIdsToBook.length > 1 ? "s" : ""} booked successfully!`
      );
      setForm({ name: "", email: "", phone: "", special_requests: "" });
      setRooms((prev) =>
        prev.filter((r) => !roomIdsToBook.includes(r.id))
      );
      setSelectedRoom(null);
      setBookingStep("quantity");
      setQuantity(1);
      setAdults(1);
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
      <div className="relative flex min-h-[750px] flex-col">
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
        <div className="px-10 pt-24 pb-4">
          <div className="grid gap-8 sm:grid-cols-3">
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

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {AMENITIES.map((amenity) => (
              <div
                key={amenity.key}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <img
                  src={amenity.image}
                  alt={`Hotel ${amenity.name.toLowerCase()}`}
                  className="h-80 w-full object-cover"
                />
                <div className="p-5 text-center">
                  <p className="text-xl font-semibold text-zinc-900">
                    {amenity.name}
                  </p>
                  <button
                    onClick={() => setSelectedAmenity(amenity)}
                    className="mt-3 text-sm font-semibold text-amber-600 underline underline-offset-2"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenity details modal */}
      {selectedAmenity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white">
            <button
              onClick={() => setSelectedAmenity(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-xl leading-none text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              ×
            </button>
            <img
              src={selectedAmenity.image}
              alt={selectedAmenity.name}
              className="h-72 w-full object-cover"
            />
            <div className="p-8">
              <h2 className="text-2xl font-bold text-zinc-900">
                {selectedAmenity.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                📍 {selectedAmenity.location}
              </p>

              <p className="mt-4 text-zinc-700">{selectedAmenity.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Open Hours
                  </p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {selectedAmenity.hours}
                  </p>
                </div>
                {selectedAmenity.note && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Note
                    </p>
                    <p className="text-lg font-semibold text-amber-600">
                      {selectedAmenity.note}
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Highlights
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {selectedAmenity.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-zinc-700"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    {feature}
                  </li>
                ))}
              </ul>
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
            {groupRoomsByType(rooms).map((room) => (
              <div
                key={room.room_type}
                className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
              >
                <img
                  src={roomImage(room)}
                  alt={room.room_type}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {room.room_type} Room
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    Up to {room.capacity} guests
                  </p>
                  <p className="text-sm font-medium text-emerald-600">
                    {room.availableCount}{" "}
                    {room.availableCount === 1 ? "room" : "rooms"} available
                  </p>
                  <p className="mt-2 text-sm text-zinc-600">
                    {ROOM_TYPE_DESCRIPTIONS[room.room_type]}
                  </p>
                  <p className="mt-2 text-lg font-bold text-zinc-900">
                    ₱{Number(room.price_per_night).toLocaleString()}{" "}
                    <span className="text-sm font-normal text-zinc-500">
                      / night
                    </span>
                  </p>
                  <button
                    onClick={() => {
                      setSelectedRoom(room);
                      setBookingStep("quantity");
                      setQuantity(1);
                      setAdults(1);
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

      {/* Step 1: Quantity + Adults selection */}
      {selectedRoom && bookingStep === "quantity" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">
                {selectedRoom.room_type} Room
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

            <div className="mt-6 flex items-center justify-between rounded-lg border border-zinc-200 p-4">
              <div>
                <p className="font-medium text-zinc-900">Quantity</p>
                <p className="text-xs text-zinc-500">
                  Max {selectedRoom.availableCount} available
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(selectedRoom.availableCount, q + 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 p-4">
              <div>
                <p className="font-medium text-zinc-900">Adults</p>
                <p className="text-xs text-zinc-500">
                  Max {selectedRoom.capacity} per room
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold text-zinc-900">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAdults((a) => Math.min(selectedRoom.capacity, a + 1))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-lg"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="flex-1 rounded-full border border-zinc-300 px-6 py-3 font-medium text-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() => setBookingStep("details")}
                className="flex-1 rounded-full bg-black px-6 py-3 font-medium text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Guest details form */}
      {selectedRoom && bookingStep === "details" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-zinc-900">
                Book {selectedRoom.room_type} Room
              </h2>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-2xl leading-none text-zinc-400"
              >
                ×
              </button>
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              {checkIn} to {checkOut} &nbsp;|&nbsp; {quantity}{" "}
              {quantity > 1 ? "rooms" : "room"} &nbsp;|&nbsp; {adults} adult
              {adults > 1 ? "s" : ""} per room
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

      <Footer />
    </main>
  );
}
