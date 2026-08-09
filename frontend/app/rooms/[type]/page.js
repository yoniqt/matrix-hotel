"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ROOM_TYPE_DESCRIPTIONS,
  ROOM_TYPE_AMENITIES,
  ROOM_TYPE_GALLERY,
  AMENITY_ICONS,
  CHECK_IN_OUT_POLICY,
  groupRoomsByType,
  slugToRoomType,
} from "../../../lib/room-data";
import { useCurrency } from "../../currency-provider";
import { useLanguage } from "../../language-provider";
import { formatPrice } from "../../../lib/currency";
import SiteHeader from "../../ui/site-header";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RoomDetailPage() {
  const { currency } = useCurrency();
  const { t } = useLanguage();
  const params = useParams();
  const searchParams = useSearchParams();
  const roomType = slugToRoomType(params.type);
  const checkIn = searchParams.get("check_in") || "";
  const checkOut = searchParams.get("check_out") || "";

  const [room, setRoom] = useState(null);
  const [loadStatus, setLoadStatus] = useState("loading");

  const gallery = ROOM_TYPE_GALLERY[roomType] || [];
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => {
    setActiveImage(0);
  }, [roomType]);
  function nextImage() {
    setActiveImage((i) => (i + 1) % gallery.length);
  }
  function prevImage() {
    setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  }

  const [quantity, setQuantity] = useState(1);
  const [adults, setAdults] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    special_requests: "",
  });
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("idle");
  const [bookingMessage, setBookingMessage] = useState("");

  useEffect(() => {
    if (!checkIn || !checkOut) {
      setLoadStatus("no-dates");
      return;
    }

    fetch(`${API_URL}/api/rooms/available?check_in=${checkIn}&check_out=${checkOut}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setLoadStatus("error");
          return;
        }
        const grouped = groupRoomsByType(data.data);
        const match = grouped.find((r) => r.room_type === roomType);
        if (!match) {
          setLoadStatus("unavailable");
          return;
        }
        setRoom(match);
        setLoadStatus("done");
      })
      .catch(() => setLoadStatus("error"));
  }, [checkIn, checkOut, roomType]);

  async function handleBookingSubmit(e) {
    e.preventDefault();
    setBookingStatus("sending");
    setBookingMessage("");

    const roomIdsToBook = room.roomIds.slice(0, quantity);

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
    } catch {
      setBookingStatus("error");
      setBookingMessage("Something went wrong. Please try again.");
    }
  }

  if (loadStatus === "no-dates") {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-[var(--text-secondary)]">
              Please search with your check-in and check-out dates first.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-[var(--accent-color)] px-6 py-3 font-medium text-black"
            >
              Back to search
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (loadStatus === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-24 text-center text-[var(--text-secondary)]">
          Loading room details...
        </main>
      </>
    );
  }

  if (loadStatus === "error" || loadStatus === "unavailable" || !room) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen bg-[var(--bg-primary)] px-6 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <p className="text-[var(--text-secondary)]">
              This room type isn&apos;t available for those dates anymore.
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-full bg-[var(--accent-color)] px-6 py-3 font-medium text-black"
            >
              Back to search
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/?check_in=${checkIn}&check_out=${checkOut}`}
          className="text-sm font-medium text-[var(--text-secondary)] underline"
        >
          {t("backToResults")}
        </Link>

        {/* Gallery - the homepage preview always shows gallery[0]; clicking
            Book This Room brings the guest here to see the rest one at a
            time via the arrows. */}
        <div className="relative mt-6 overflow-hidden rounded-2xl">
          <img
            src={gallery[activeImage]}
            alt={`${roomType} room photo ${activeImage + 1}`}
            className="aspect-[3/2] w-full object-cover"
          />

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous photo"
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-xl text-white backdrop-blur-sm transition-all hover:bg-[var(--accent-color)] hover:text-black"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next photo"
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-3 text-xl text-white backdrop-blur-sm transition-all hover:bg-[var(--accent-color)] hover:text-black"
              >
                ›
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {gallery.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    aria-label={`Show photo ${i + 1}`}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === activeImage
                        ? "w-5 bg-[var(--accent-color)]"
                        : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {roomType} Room
            </h1>
            <p className="mt-2 text-sm font-medium text-emerald-400">
              {room.availableCount}{" "}
              {room.availableCount === 1 ? "room" : "rooms"} {t("available")}{" "}
              for your dates
            </p>
            <p className="mt-4 leading-7 text-[var(--text-secondary)]">
              {ROOM_TYPE_DESCRIPTIONS[roomType]}
            </p>
            <p className="mt-2 text-[var(--text-secondary)]">
              Up to {room.capacity} guests {t("perRoom")}
            </p>

            <h2 className="mt-8 text-lg font-bold text-[var(--text-primary)]">
              {t("roomAmenities")}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-y-2 text-[var(--text-secondary)]">
              {ROOM_TYPE_AMENITIES[roomType].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-lg">{AMENITY_ICONS[item] || "•"}</span>
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-lg font-bold text-[var(--text-primary)]">
              {t("checkInOut")}
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-[var(--text-secondary)]">
              <li>
                <span className="font-semibold text-[var(--text-primary)]">
                  {t("checkIn")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.checkIn}
              </li>
              <li>
                <span className="font-semibold text-[var(--text-primary)]">
                  {t("checkOut")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.checkOut}
              </li>
              <li>
                <span className="font-semibold text-[var(--text-primary)]">
                  {t("lateCheckoutHours")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.lateCheckoutHours}
              </li>
              <li>
                <span className="font-semibold text-[var(--text-primary)]">
                  {t("lateCheckoutFee")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.lateCheckoutFee}
              </li>
            </ul>
          </div>

          {/* Booking panel */}
          <div className="h-fit rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-sm">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {formatPrice(room.price_per_night, currency)}{" "}
              <span className="text-sm font-normal text-[var(--text-secondary)]">
                / night
              </span>
            </p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {checkIn} to {checkOut}
            </p>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-[var(--border-color)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t("quantity")}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("max")} {room.availableCount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-[var(--text-primary)]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(room.availableCount, q + 1))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-[var(--border-color)] p-3">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {t("adults")}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t("max")} {room.capacity} {t("perRoom")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-[var(--text-primary)]">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAdults((a) => Math.min(room.capacity, a + 1))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-primary)]"
                >
                  +
                </button>
              </div>
            </div>

            <form
              onSubmit={handleBookingSubmit}
              className="mt-4 flex flex-col gap-3"
            >
              <input
                required
                placeholder={t("fullName")}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              />
              <input
                required
                type="email"
                placeholder={t("email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              />
              <input
                required
                placeholder={t("phoneNumber")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              />
              <textarea
                placeholder={t("specialRequests")}
                value={form.special_requests}
                onChange={(e) =>
                  setForm({ ...form, special_requests: e.target.value })
                }
                className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              />

              <div className="rounded-lg border border-[var(--border-color)] bg-[var(--input-bg)] p-3 text-xs text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">
                  {t("cancellationPolicy")}
                </p>
                <p className="mt-1">{t("cancellationPolicyText")}</p>
              </div>

              <label className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  required
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-0.5"
                />
                {t("agreePolicy")}
              </label>

              <button
                type="submit"
                disabled={bookingStatus === "sending" || !agreedToPolicy}
                className="rounded-full bg-[var(--accent-color)] px-6 py-3 font-medium text-black disabled:opacity-50"
              >
                {bookingStatus === "sending" ? t("booking") : t("confirmBooking")}
              </button>

              {bookingMessage && (
                <p
                  className={
                    bookingStatus === "success"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {bookingMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
      </main>
    </>
  );
}
