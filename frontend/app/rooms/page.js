"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../ui/site-header";
import Footer from "../ui/footer";
import { useCurrency } from "../currency-provider";
import { useLanguage } from "../language-provider";
import { formatPrice } from "../../lib/currency";
import {
  getRoomTypeDescription,
  groupRoomsByType,
  roomTypeToSlug,
} from "../../lib/room-data";
import { useRoomTypePhotos } from "../../lib/use-room-type-photos";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RoomsPage() {
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const { getImage } = useRoomTypePhotos();
  const [rooms, setRooms] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data.success ? data.data : []))
      .catch(() => setRooms([]));
  }, []);

  let grouped = rooms ? groupRoomsByType(rooms) : [];

  if (minPrice) {
    grouped = grouped.filter((r) => Number(r.price_per_night) >= Number(minPrice));
  }
  if (maxPrice) {
    grouped = grouped.filter((r) => Number(r.price_per_night) <= Number(maxPrice));
  }
  if (sortBy === "price-low") {
    grouped = [...grouped].sort((a, b) => a.price_per_night - b.price_per_night);
  } else if (sortBy === "price-high") {
    grouped = [...grouped].sort((a, b) => b.price_per_night - a.price_per_night);
  }

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-strong)] uppercase">
          {t("featuredLabel")}
        </p>
        <h1 className="mt-4 text-4xl font-bold text-[var(--text-primary)] sm:text-5xl">
          {t("roomsHeadline")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-[var(--text-secondary)]">
          {t("roomsSubtext")}
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-6 pb-24">
        {rooms === null && (
          <p className="text-center text-[var(--text-secondary)]">
            {t("searching")}
          </p>
        )}

        {rooms && rooms.length > 0 && (
          <div className="mb-8 flex flex-wrap items-end justify-center gap-4">
            <label className="text-sm text-[var(--text-secondary)]">
              Min price
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="₱0"
                className="mt-1 block w-28 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Max price
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Any"
                className="mt-1 block w-28 rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              />
            </label>
            <label className="text-sm text-[var(--text-secondary)]">
              Sort by
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="mt-1 block rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              >
                <option value="default">Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </div>
        )}

        {rooms && rooms.length > 0 && grouped.length === 0 && (
          <p className="text-center text-[var(--text-secondary)]">
            No rooms match that price range.
          </p>
        )}

        <div className="grid gap-8 sm:grid-cols-2">
          {grouped.map((room) => (
            <div
              key={room.room_type}
              className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm"
            >
              <img
                src={getImage(room.room_type)}
                alt={room.room_type}
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  {room.room_type} Room
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Up to {room.capacity} guests
                </p>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  {getRoomTypeDescription(room.room_type)}
                </p>
                <p className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                  {formatPrice(room.price_per_night, currency)}{" "}
                  <span className="text-sm font-normal text-[var(--text-secondary)]">
                    / night
                  </span>
                </p>
                <Link
                  href={`/rooms/${roomTypeToSlug(room.room_type)}?from=rooms`}
                  className="mt-5 block w-full rounded-full bg-[var(--accent-color)] px-5 py-2.5 text-center font-medium text-black transition-opacity hover:opacity-90"
                >
                  {t("bookNow")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
