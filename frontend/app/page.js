"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    check_in_date: "",
    check_out_date: "",
    special_requests: "",
  });
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRooms(data.data);
      })
      .catch(() => setMessage("Could not load rooms. Is the backend running?"));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, room_id: selectedRoom.id }),
      });
      const data = await res.json();

      if (!data.success) {
        setStatus("error");
        setMessage(data.message);
        return;
      }

      setStatus("success");
      setMessage("Booking confirmed!");
      setForm({
        name: "",
        email: "",
        phone: "",
        check_in_date: "",
        check_out_date: "",
        special_requests: "",
      });
      setSelectedRoom(null);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">Hotel Room Booking</h1>
      <p className="mt-2 text-zinc-600">
        Browse available rooms and reserve your stay.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-xl border border-zinc-200 p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold">Room {room.room_number}</h2>
            <p className="text-zinc-600">{room.room_type}</p>
            <p className="mt-2 text-zinc-600">
              Up to {room.capacity} guests
            </p>
            <p className="mt-2 text-lg font-bold">
              ₱{Number(room.price_per_night).toLocaleString()} / night
            </p>
            <button
              onClick={() => {
                setSelectedRoom(room);
                setStatus("idle");
                setMessage("");
              }}
              className="mt-4 rounded-full bg-black px-5 py-2 font-medium text-white"
            >
              Book this room
            </button>
          </div>
        ))}
      </div>

      {rooms.length === 0 && !message && (
        <p className="mt-10 text-zinc-500">Loading rooms...</p>
      )}
      {message && rooms.length === 0 && (
        <p className="mt-10 text-red-600">{message}</p>
      )}

      {selectedRoom && (
        <div className="mt-10 rounded-xl border border-zinc-200 p-6">
          <h2 className="text-xl font-semibold">
            Booking Room {selectedRoom.room_number}
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
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
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-zinc-600">Check-in</label>
                <input
                  required
                  type="date"
                  value={form.check_in_date}
                  onChange={(e) =>
                    setForm({ ...form, check_in_date: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-zinc-600">Check-out</label>
                <input
                  required
                  type="date"
                  value={form.check_out_date}
                  onChange={(e) =>
                    setForm({ ...form, check_out_date: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2"
                />
              </div>
            </div>
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
              disabled={status === "sending"}
              className="rounded-full bg-black px-6 py-3 font-medium text-white disabled:opacity-50"
            >
              {status === "sending" ? "Booking..." : "Confirm booking"}
            </button>

            {message && (
              <p
                className={
                  status === "success" ? "text-green-600" : "text-red-600"
                }
              >
                {message}
              </p>
            )}
          </form>
        </div>
      )}
    </main>
  );
}
