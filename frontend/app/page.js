"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import DatePicker from "./ui/date-picker";
import HeroCarousel from "./ui/hero-carousel";
import Footer from "./ui/footer";
import SiteHeader from "./ui/site-header";
import WelcomeOverlay from "./ui/welcome-overlay";
import { useCurrency } from "./currency-provider";
import { useLanguage } from "./language-provider";
import { formatPrice } from "../lib/currency";
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

const SERVICES = [
  {
    key: "wifi",
    icon: "📶",
    name: "Free WiFi",
    description: "High-speed internet throughout the hotel",
  },
  {
    key: "parking",
    icon: "🅿️",
    name: "Free Parking",
    description: "Secure on-site parking for all guests",
  },
  {
    key: "frontdesk",
    icon: "🛎️",
    name: "24/7 Front Desk",
    description: "Round-the-clock assistance whenever you need it",
  },
  {
    key: "laundry",
    icon: "🧺",
    name: "Laundry Service",
    description: "Same-day laundry and dry cleaning",
  },
  {
    key: "transfer",
    icon: "🚐",
    name: "Airport Transfer",
    description: "Convenient pick-up and drop-off service",
  },
  {
    key: "roomservice",
    icon: "🍽️",
    name: "Room Service",
    description: "In-room dining available around the clock",
  },
];

const NEWS_EVENTS = [
  {
    key: "bar",
    image: "/images/amenities/bar.jpg",
    title: "Unwind at Our Rooftop Bar",
  },
  {
    key: "pool",
    image: "/images/amenities/pool.jpg",
    title: "Dive Into Our Pool Season",
  },
  {
    key: "lobby",
    image: "/images/hero/lobby.webp",
    title: "A Look Inside Our Lobby",
  },
];

export default function Home() {
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [openPicker, setOpenPicker] = useState(null); // "checkin" | "checkout" | null
  const [rooms, setRooms] = useState(null);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchMessage, setSearchMessage] = useState("");

  const [selectedAmenity, setSelectedAmenity] = useState(null);

  const [showWelcome, setShowWelcome] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2200);
    return () => clearTimeout(timer);
  }, []);

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
    <main className="min-h-screen bg-zinc-950">
      <WelcomeOverlay show={showWelcome} />

      <SiteHeader />

      {/* Hero */}
      <div className="relative flex min-h-[690px] flex-col">
        <HeroCarousel />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center text-white">
          <p className="text-sm font-semibold tracking-widest uppercase text-amber-300">
            {t("tagline")}
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold sm:text-5xl">
            {t("headline")}
          </h1>
        </div>

        {/* Search widget, overlapping the bottom of the hero */}
        <form
          onSubmit={handleSearch}
          className="relative z-10 mx-auto -mb-10 flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl sm:flex-row sm:items-end"
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
            {searchStatus === "searching" ? t("searching") : t("search")}
          </button>
        </form>
      </div>

      {/* Showcase - always visible, fills the page before anyone searches.
          Rooms are intentionally NOT shown here - they only appear after a
          date search, so this section is purely about hotel amenities. */}
      {searchStatus === "idle" && (
        <div className="mx-auto max-w-[1680px] px-10 pt-24 pb-4">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-3xl">
                🏋️
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-100">
                Fitness Gym
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Fully equipped 24-hour gym for guests at any time of day.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-3xl">
                🏊
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-100">
                Infinity Pool
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Relax by our rooftop infinity pool with a stunning city view.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-3xl">
                🍸
              </div>
              <h3 className="mt-4 text-xl font-bold text-zinc-100">
                Rooftop Bar
              </h3>
              <p className="mt-1 text-sm text-zinc-400">
                Handcrafted cocktails and city views, open every evening.
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {AMENITIES.map((amenity) => (
              <div
                key={amenity.key}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm"
              >
                <img
                  src={amenity.image}
                  alt={`Hotel ${amenity.name.toLowerCase()}`}
                  className="h-72 w-full object-cover"
                />
                <div className="p-5 text-center">
                  <p className="text-xl font-semibold text-zinc-100">
                    {amenity.name}
                  </p>
                  <button
                    onClick={() => setSelectedAmenity(amenity)}
                    className="mt-3 text-sm font-semibold text-amber-400 underline underline-offset-2"
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
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900">
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
              <h2 className="text-2xl font-bold text-zinc-100">
                {selectedAmenity.name}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                📍 {selectedAmenity.location}
              </p>

              <p className="mt-4 text-zinc-300">{selectedAmenity.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Open Hours
                  </p>
                  <p className="text-lg font-semibold text-zinc-100">
                    {selectedAmenity.hours}
                  </p>
                </div>
                {selectedAmenity.note && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                      Note
                    </p>
                    <p className="text-lg font-semibold text-amber-400">
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
                    className="flex items-center gap-3 text-zinc-300"
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
          <p className="text-center text-zinc-400">
            Pick your check-in and check-out dates above to see available rooms.
          </p>
        )}
        {searchStatus === "error" && (
          <p className="text-center text-red-400">{searchMessage}</p>
        )}
        {rooms && rooms.length === 0 && (
          <p className="text-center text-zinc-400">
            No rooms available for those dates. Try different dates.
          </p>
        )}

        {rooms && rooms.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groupRoomsByType(rooms).map((room) => (
              <div
                key={room.room_type}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm"
              >
                <img
                  src={roomImage(room)}
                  alt={room.room_type}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-zinc-100">
                    {room.room_type} Room
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Up to {room.capacity} guests
                  </p>
                  <p className="text-sm font-medium text-emerald-400">
                    {room.availableCount}{" "}
                    {room.availableCount === 1 ? "room" : "rooms"} available
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    {ROOM_TYPE_DESCRIPTIONS[room.room_type]}
                  </p>
                  <p className="mt-2 text-lg font-bold text-zinc-100">
                    {formatPrice(room.price_per_night, currency)}{" "}
                    <span className="text-sm font-normal text-zinc-500">
                      / night
                    </span>
                  </p>
                  <Link
                    href={`/rooms/${roomTypeToSlug(room.room_type)}?check_in=${checkIn}&check_out=${checkOut}`}
                    className="mt-4 block w-full rounded-full bg-amber-500 px-5 py-2 text-center font-medium text-black transition-opacity hover:opacity-90"
                  >
                    {t("bookThisRoom")}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Services & Utilities */}
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <p className="text-center text-xs font-semibold tracking-[0.3em] text-amber-400 uppercase">
          {t("featuredLabel")}
        </p>
        <h2 className="mt-2 text-center text-2xl font-bold tracking-wide text-zinc-100 uppercase sm:text-3xl">
          {t("servicesUtilities")}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <div
              key={service.key}
              className="group relative flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-400/30 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.25)] sm:p-8"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/5 text-2xl ring-1 ring-amber-400/10">
                {service.icon}
              </div>
              <div className="relative">
                <p className="text-base font-semibold text-zinc-100">
                  {service.name}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* News & Events */}
      <div className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1" />
          <h2 className="flex-[2] text-center text-2xl font-semibold tracking-wide text-zinc-100 uppercase">
            {t("newsEvents")}
          </h2>
          <div className="flex flex-1 justify-end">
            <a
              href="#"
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              {t("viewAll")} +
            </a>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {NEWS_EVENTS.map((item) => (
            <div
              key={item.key}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-5 text-center">
                <p className="font-semibold text-zinc-100">{item.title}</p>
                <hr className="my-3 border-zinc-800" />
                <a
                  href="#"
                  className="text-sm font-semibold text-amber-400 underline underline-offset-2"
                >
                  {t("viewDetails")} →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location - dummy address for now, placeholder for the real hotel */}
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm">
          <div className="px-6 py-8 text-center sm:px-10">
            <h2 className="text-2xl font-bold tracking-wide text-zinc-100 uppercase">
              {t("ourLocation")}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              📍 Pinacpinacan, San Rafael, Bulacan, Philippines
            </p>
          </div>
          <iframe
            title="Hotel location map"
            src="https://www.google.com/maps?q=15.0016,120.9552&z=16&output=embed"
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
