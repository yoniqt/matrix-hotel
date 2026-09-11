"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminToken, clearAdminToken } from "../../lib/admin-api";
import { useTheme } from "../theme-provider";

const NAV_LINKS = [
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/rooms", label: "Rooms" },
  { href: "/admin/photos", label: "Photos" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecked(true);
      return;
    }
    if (!getAdminToken()) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [pathname, router]);

  if (pathname === "/admin/login") return children;
  if (!checked) return null;

  function handleLogout() {
    clearAdminToken();
    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-8 py-4">
        <span className="text-lg font-semibold italic text-[var(--text-primary)]">
          The Matrix Hotel — Admin
        </span>
        <nav className="flex items-center gap-2 text-sm font-medium">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-full px-3 py-1 ${
                pathname.startsWith(href)
                  ? "bg-[var(--border-color)] text-[var(--accent-color)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="ml-2 rounded-full border border-[var(--border-color)] px-3 py-1 text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[var(--border-color)] px-3 py-1 text-[var(--text-secondary)] hover:border-red-400 hover:text-red-400"
          >
            Log Out
          </button>
        </nav>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
