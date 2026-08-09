export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="bg-[var(--bg-secondary)] px-6 py-12 text-[var(--text-secondary)]"
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium tracking-wide text-[var(--text-secondary)] uppercase">
        <span>About Us</span>
        <span>Amenities</span>
        <span>Hotel Policy</span>
        <span>Security Policy</span>
        <span>Map & Direction</span>
        <span>Contact Us</span>
      </nav>

      <div className="mt-10 text-center">
        <p className="text-2xl font-bold text-[var(--accent-strong)] italic">
          The Matrix Hotel
        </p>
        <p className="mt-1 text-xs tracking-widest text-[var(--text-secondary)] uppercase">
          ★★★★★ Luxury &amp; Comfort
        </p>
      </div>

      <div className="mt-8 text-center text-sm">
        <p>
          <span className="font-semibold text-[var(--text-primary)]">
            Address:
          </span>{" "}
          123 Bonifacio Global City, Taguig, Metro Manila, Philippines
        </p>
        <p className="mt-3">
          <span className="font-semibold text-[var(--text-primary)]">
            Phone:
          </span>{" "}
          +63 900 000 0000 &nbsp;|&nbsp;{" "}
          <span className="font-semibold text-[var(--text-primary)]">
            Email:
          </span>{" "}
          stay@thematrixhotel.com
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-4xl border-t border-[var(--border-color)] pt-8">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              Find us on
            </p>
            <div className="mt-3 flex justify-center gap-3 sm:justify-start">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white transition-transform hover:scale-105"
              >
                f
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white transition-transform hover:scale-105"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M12 2c2.7 0 3.05.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.21.6 1.76 1.15.55.55.9 1.1 1.15 1.76.25.64.42 1.37.47 2.43C21.99 8.95 22 9.3 22 12s-.01 3.05-.06 4.12c-.05 1.06-.22 1.79-.47 2.43-.26.66-.6 1.21-1.15 1.76-.55.55-1.1.9-1.76 1.15-.64.25-1.37.42-2.43.47C15.05 21.99 14.7 22 12 22s-3.05-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47-.66-.26-1.21-.6-1.76-1.15-.55-.55-.9-1.1-1.15-1.76-.25-.64-.42-1.37-.47-2.43C2.01 15.05 2 14.7 2 12s.01-3.05.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.21 1.15-1.76.55-.55 1.1-.9 1.76-1.15.64-.25 1.37-.42 2.43-.47C8.95 2.01 9.3 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.2-8.4a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" />
                </svg>
              </a>
              <a
                href="mailto:stay@thematrixhotel.com"
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white transition-transform hover:scale-105"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
              Accepted Cards
            </p>
            <div className="mt-3 flex justify-center gap-2">
              <span className="flex h-8 items-center rounded bg-white px-3 text-sm font-black tracking-tight text-blue-700 italic">
                VISA
              </span>
              <span className="flex h-8 w-12 items-center justify-center rounded bg-white">
                <span className="flex items-center">
                  <span className="h-5 w-5 rounded-full bg-red-500" />
                  <span className="-ml-2 h-5 w-5 rounded-full bg-amber-400 opacity-90" />
                </span>
              </span>
              <span className="flex h-8 items-center rounded bg-blue-800 px-3 text-xs font-bold text-white">
                AMEX
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-[var(--text-secondary)]">
        Copyright © 2026 The Matrix Hotel. All rights reserved.
      </p>
    </footer>
  );
}
