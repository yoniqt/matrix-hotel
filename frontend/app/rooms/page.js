"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "../ui/site-header";
import Footer from "../ui/footer";
import { useCurrency } from "../currency-provider";
import { useLanguage } from "../language-provider";
import { formatPrice } from "../../lib/currency";
import {
  roomImage,
  ROOM_TYPE_DESCRIPTIONS,
  groupRoomsByType,
  roomTypeToSlug,
} from "../../lib/room-data";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RoomsPage() {
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const [rooms, setRooms] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then((res) => res.json())
      .then((data) => setRooms(data.success ? data.data : []))
      .catch(() => setRooms([]));
  }, []);

  const grouped = rooms ? groupRoomsByType(rooms) : [];

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

        <div className="grid gap-8 sm:grid-cols-2">
          {grouped.map((room) => (
            <div
              key={room.room_type}
              className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm"
            >
              <img
                src={roomImage(room)}
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
                  {ROOM_TYPE_DESCRIPTIONS[room.room_type]}
                </p>
                <p className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                  {formatPrice(room.price_per_night, currency)}{" "}
                  <span className="text-sm font-normal text-[var(--text-secondary)]">
                    / night
                  </span>
                </p>
                <Link
                  href={`/rooms/${roomTypeToSlug(room.room_type)}`}
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
