"use client";

import { useState } from "react";
import Link from "next/link";
import DatePicker from "./ui/date-picker";
import HeroCarousel from "./ui/hero-carousel";
import Footer from "./ui/footer";
import {
  roomImage,
  ROOM_TYPE_DESCRIPTIONS,
  groupRoomsByType,
  roomTypeToSlug,
} from "../lib/room-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
                  <Link
                    href={`/rooms/${roomTypeToSlug(room.room_type)}?check_in=${checkIn}&check_out=${checkOut}`}
                    className="mt-4 block w-full rounded-full bg-black px-5 py-2 text-center font-medium text-white"
                  >
                    Book this room
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hotel Policies */}
      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="border-t border-zinc-200 pt-12">
          <h2 className="text-xl font-bold text-zinc-900">
            Check-In and Check-Out Policies
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-zinc-700">
            <li>
              <span className="font-semibold text-zinc-900">Check-in:</span>{" "}
              2:00 PM
            </li>
            <li>
              <span className="font-semibold text-zinc-900">Check-out:</span>{" "}
              12:00 PM
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                Late Checkout Hours:
              </span>{" "}
              Until 3:00 PM (on request, subject to availability)
            </li>
            <li>
              <span className="font-semibold text-zinc-900">
                Late Checkout Fee:
              </span>{" "}
              50% of nightly rate
            </li>
          </ul>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-10">
          <h2 className="text-xl font-bold text-zinc-900">
            Property and Cancellation Policies
          </h2>
          <p className="mt-4 leading-7 text-zinc-700">
            All booking and cancellation requests must be made in writing or
            via email, and confirmed by the hotel. Free cancellation is
            available up to 48 hours before check-in; cancellations made
            after that will be charged for one night's stay. Full payment is
            required at the time the booking confirmation is received.
          </p>
        </div>

        <div className="mt-10 border-t border-zinc-200 pt-10">
          <h2 className="text-xl font-bold text-zinc-900">
            Terms and Conditions
          </h2>

          <h3 className="mt-4 font-semibold text-zinc-900 underline underline-offset-2">
            Benefits Included
          </h3>
          <ul className="mt-2 flex flex-col gap-1 text-zinc-700">
            <li>Welcome drink upon arrival</li>
            <li>Daily breakfast included</li>
            <li>Free access to the gym and pool</li>
            <li>Free Wi-Fi for all guests</li>
          </ul>

          <h3 className="mt-6 font-semibold text-zinc-900">
            Children Policy
          </h3>
          <p className="mt-2 text-zinc-700">
            Children under 12 may stay free of charge when sharing a bed with
            parents. Meals (breakfast, lunch, or dinner) are chargeable
            separately for children.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
