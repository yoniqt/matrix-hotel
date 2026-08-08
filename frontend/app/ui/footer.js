export default function Footer() {
  return (
    <footer className="bg-zinc-900 px-6 py-12 text-zinc-300">
      <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium tracking-wide text-zinc-400 uppercase">
        <span>About Us</span>
        <span>Amenities</span>
        <span>Hotel Policy</span>
        <span>Security Policy</span>
        <span>Map & Direction</span>
        <span>Contact Us</span>
      </nav>

      <div className="mt-10 text-center">
        <p className="text-2xl font-bold text-amber-400 italic">
          The Matrix Hotel
        </p>
        <p className="mt-1 text-xs tracking-widest text-zinc-500 uppercase">
          ★★★★★ Luxury &amp; Comfort
        </p>
      </div>

      <div className="mt-8 text-center text-sm">
        <p>
          <span className="font-semibold text-zinc-200">Address:</span> 123
          Bonifacio Global City, Taguig, Metro Manila, Philippines
        </p>
        <p className="mt-3">
          <span className="font-semibold text-zinc-200">Phone:</span> +63 900
          000 0000 &nbsp;|&nbsp;{" "}
          <span className="font-semibold text-zinc-200">Email:</span>{" "}
          stay@thematrixhotel.com
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl border-t border-zinc-800 pt-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              Find us on
            </p>
            <div className="mt-3 flex justify-center gap-3 sm:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm">
                📘
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm">
                📸
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase">
              Accepted Cards
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-semibold">
                VISA
              </span>
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-semibold">
                Mastercard
              </span>
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-semibold">
                Amex
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-zinc-600">
        Copyright © 2026 The Matrix Hotel. All rights reserved.
      </p>
    </footer>
  );
}
