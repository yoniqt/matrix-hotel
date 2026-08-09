"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DatePicker from "./ui/date-picker";
import HeroCarousel from "./ui/hero-carousel";
import Footer from "./ui/footer";
import SiteHeader from "./ui/site-header";
import WelcomeOverlay from "./ui/welcome-overlay";
import NewsEvents from "./ui/news-events";
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
    title: "Fitness Gym",
    tag: "01 / WELLNESS",
    blurb: "Fully equipped 24-hour gym for guests at any time of day.",
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
    title: "Infinity Pool",
    tag: "02 / RELAXATION",
    blurb: "Relax by our rooftop infinity pool with a stunning city view.",
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
    title: "Rooftop Bar",
    tag: "03 / NIGHTLIFE",
    blurb: "Handcrafted cocktails and city views, open every evening.",
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


export default function Home() {
  const router = useRouter();
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

  async function performSearch(ci, co) {
    if (!ci || !co) {
      setSearchStatus("error");
      setSearchMessage("Please select both check-in and check-out dates.");
      return;
    }

    setSearchStatus("searching");
    setSearchMessage("");
    setRooms(null);

    try {
      const res = await fetch(
        `${API_URL}/api/rooms/available?check_in=${ci}&check_out=${co}`
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

  function handleSearch(e) {
    e.preventDefault();
    performSearch(checkIn, checkOut);
  }

  function clearSearch() {
    setCheckIn("");
    setCheckOut("");
    setRooms(null);
    setSearchStatus("idle");
    setSearchMessage("");
    router.replace("/");
  }

  // If we arrived here via "Back to search results" from a room detail
  // page, the dates are in the URL - restore them and re-run the search
  // instead of dropping the visitor back at an empty idle state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ci = params.get("check_in");
    const co = params.get("check_out");
    if (ci && co) {
      setCheckIn(ci);
      setCheckOut(co);
      performSearch(ci, co);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
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
          className="relative z-10 mx-auto -mb-10 flex w-full max-w-3xl flex-col gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-xl sm:flex-row sm:items-end"
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
            className="rounded-lg bg-[var(--accent-color)] px-8 py-2.5 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {searchStatus === "searching" ? t("searching") : t("search")}
          </button>
          {(checkIn || checkOut) && (
            <button
              type="button"
              onClick={clearSearch}
              className="rounded-lg border border-[var(--border-color)] px-6 py-2.5 font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
            >
              {t("clear")}
            </button>
          )}
        </form>
      </div>

      {/* Showcase - visible before a successful search (idle) and also
          when the search form itself was invalid (error) - a validation
          message like "checkout must be after checkin" shouldn't blank
          out the whole page, only a real result set should replace this. */}
      {(searchStatus === "idle" || searchStatus === "error") && (
        <div className="mx-auto max-w-[1680px] px-10 pt-24 pb-4">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              {t("pickDatesHint")}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-widest text-[var(--text-primary)] uppercase sm:text-5xl">
              {t("escapeHeadline")}
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base text-[var(--text-secondary)] sm:text-lg">
              {t("escapeParagraph")}
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {AMENITIES.map((amenity) => (
              <div
                key={amenity.key}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.05]"
              >
                <img
                  src={amenity.image}
                  alt={`Hotel ${amenity.name.toLowerCase()}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
                    {amenity.tag}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-wide text-white">
                    {amenity.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-300/90">
                    {amenity.blurb}
                  </p>
                  <button
                    onClick={() => setSelectedAmenity(amenity)}
                    className="group/link mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-400"
                  >
                    <span className="border-b border-transparent pb-0.5 group-hover/link:border-amber-400">
                      View Details
                    </span>
                    <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                      →
                    </span>
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
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
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
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                {selectedAmenity.name}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                📍 {selectedAmenity.location}
              </p>

              <p className="mt-4 text-[var(--text-secondary)]">
                {selectedAmenity.description}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Open Hours
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {selectedAmenity.hours}
                  </p>
                </div>
                {selectedAmenity.note && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                      Note
                    </p>
                    <p className="text-lg font-semibold text-[var(--accent-strong)]">
                      {selectedAmenity.note}
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Highlights
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {selectedAmenity.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-[var(--text-secondary)]"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-color)]" />
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
        {searchStatus === "error" && (
          <p className="text-center text-red-400">{searchMessage}</p>
        )}
        {rooms && rooms.length === 0 && (
          <p className="text-center text-[var(--text-secondary)]">
            No rooms available for those dates. Try different dates.
          </p>
        )}

        {rooms && rooms.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {groupRoomsByType(rooms).map((room) => (
              <div
                key={room.room_type}
                className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm"
              >
                <img
                  src={roomImage(room)}
                  alt={room.room_type}
                  className="h-44 w-full object-cover"
                />
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {room.room_type} Room
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    Up to {room.capacity} guests
                  </p>
                  <p className="text-sm font-medium text-emerald-400">
                    {room.availableCount}{" "}
                    {room.availableCount === 1 ? "room" : "rooms"} available
                  </p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {ROOM_TYPE_DESCRIPTIONS[room.room_type]}
                  </p>
                  <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
                    {formatPrice(room.price_per_night, currency)}{" "}
                    <span className="text-sm font-normal text-[var(--text-secondary)]">
                      / night
                    </span>
                  </p>
                  <Link
                    href={`/rooms/${roomTypeToSlug(room.room_type)}?check_in=${checkIn}&check_out=${checkOut}`}
                    className="mt-4 block w-full rounded-full bg-[var(--accent-color)] px-5 py-2 text-center font-medium text-black transition-opacity hover:opacity-90"
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
      <section className="border-t border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="lg:flex lg:items-start lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:w-1/3">
              <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-strong)] uppercase">
                {t("featuredLabel")}
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                {t("servicesHeadline")}
              </h2>
              <p className="mt-6 leading-relaxed text-[var(--text-secondary)]">
                {t("servicesDescription")}
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-0 lg:w-2/3">
              {SERVICES.map((service) => (
                <div
                  key={service.key}
                  className="group relative flex items-start gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-glass)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-color)] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] sm:p-8"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-color)]/10 text-3xl text-[var(--accent-color)]">
                    {service.icon}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[var(--text-primary)]">
                      {service.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <NewsEvents />

      {/* Location - dummy address for now, placeholder for the real hotel */}
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm">
          <div className="px-6 py-8 text-center sm:px-10">
            <h2 className="text-2xl font-bold tracking-wide text-[var(--text-primary)] uppercase">
              {t("ourLocation")}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
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
