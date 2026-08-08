"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  roomImage,
  ROOM_TYPE_DESCRIPTIONS,
  ROOM_TYPE_AMENITIES,
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
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-zinc-600">
            Please search with your check-in and check-out dates first.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-medium text-white"
          >
            Back to search
          </Link>
        </main>
      </>
    );
  }

  if (loadStatus === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center text-zinc-500">
          Loading room details...
        </main>
      </>
    );
  }

  if (loadStatus === "error" || loadStatus === "unavailable" || !room) {
    return (
      <>
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-zinc-600">
            This room type isn&apos;t available for those dates anymore.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-black px-6 py-3 font-medium text-white"
          >
            Back to search
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/" className="text-sm font-medium text-zinc-500 underline">
          {t("backToResults")}
        </Link>

        {/* Gallery - currently one photo per type; more can be added later */}
        <div className="mt-6 overflow-hidden rounded-2xl">
          <img
            src={roomImage(room)}
            alt={roomType}
            className="h-[420px] w-full object-cover"
          />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-zinc-900">
              {roomType} Room
            </h1>
            <p className="mt-2 text-sm font-medium text-emerald-600">
              {room.availableCount}{" "}
              {room.availableCount === 1 ? "room" : "rooms"} {t("available")}{" "}
              for your dates
            </p>
            <p className="mt-4 leading-7 text-zinc-700">
              {ROOM_TYPE_DESCRIPTIONS[roomType]}
            </p>
            <p className="mt-2 text-zinc-600">
              Up to {room.capacity} guests {t("perRoom")}
            </p>

            <h2 className="mt-8 text-lg font-bold text-zinc-900">
              {t("roomAmenities")}
            </h2>
            <ul className="mt-3 grid grid-cols-2 gap-y-2 text-zinc-700">
              {ROOM_TYPE_AMENITIES[roomType].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-lg">{AMENITY_ICONS[item] || "•"}</span>
                  {item}
                </li>
              ))}
            </ul>

            <h2 className="mt-8 text-lg font-bold text-zinc-900">
              {t("checkInOut")}
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-zinc-700">
              <li>
                <span className="font-semibold text-zinc-900">
                  {t("checkIn")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.checkIn}
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  {t("checkOut")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.checkOut}
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  {t("lateCheckoutHours")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.lateCheckoutHours}
              </li>
              <li>
                <span className="font-semibold text-zinc-900">
                  {t("lateCheckoutFee")}
                </span>{" "}
                {CHECK_IN_OUT_POLICY.lateCheckoutFee}
              </li>
            </ul>
          </div>

          {/* Booking panel */}
          <div className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-2xl font-bold text-zinc-900">
              {formatPrice(room.price_per_night, currency)}{" "}
              <span className="text-sm font-normal text-zinc-500">
                / night
              </span>
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {checkIn} to {checkOut}
            </p>

            <div className="mt-6 flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {t("quantity")}
                </p>
                <p className="text-xs text-zinc-500">
                  {t("max")} {room.availableCount}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-zinc-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(room.availableCount, q + 1))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300"
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <div>
                <p className="text-sm font-medium text-zinc-900">
                  {t("adults")}
                </p>
                <p className="text-xs text-zinc-500">
                  {t("max")} {room.capacity} {t("perRoom")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300"
                >
                  −
                </button>
                <span className="w-5 text-center font-semibold text-zinc-900">
                  {adults}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAdults((a) => Math.min(room.capacity, a + 1))
                  }
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-300"
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
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
              <input
                required
                type="email"
                placeholder={t("email")}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
              <input
                required
                placeholder={t("phoneNumber")}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
              <textarea
                placeholder={t("specialRequests")}
                value={form.special_requests}
                onChange={(e) =>
                  setForm({ ...form, special_requests: e.target.value })
                }
                className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />

              <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
                <p className="font-semibold text-zinc-900">
                  {t("cancellationPolicy")}
                </p>
                <p className="mt-1">{t("cancellationPolicyText")}</p>
              </div>

              <label className="flex items-start gap-2 text-xs text-zinc-700">
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
                className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
              >
                {bookingStatus === "sending" ? t("booking") : t("confirmBooking")}
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
      </div>
      </main>
    </>
  );
}
