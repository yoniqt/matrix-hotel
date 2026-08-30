"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminToken, clearAdminToken } from "../../lib/admin-api";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
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
          <Link
            href="/admin/bookings"
            className={`rounded-full px-3 py-1 ${
              pathname.startsWith("/admin/bookings")
                ? "bg-[var(--border-color)] text-[var(--accent-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
            }`}
          >
            Bookings
          </Link>
          <Link
            href="/admin/rooms"
            className={`rounded-full px-3 py-1 ${
              pathname.startsWith("/admin/rooms")
                ? "bg-[var(--border-color)] text-[var(--accent-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
            }`}
          >
            Rooms
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-2 rounded-full border border-[var(--border-color)] px-3 py-1 text-[var(--text-secondary)] hover:border-red-400 hover:text-red-400"
          >
            Log Out
          </button>
        </nav>
      </header>
      <main className="p-8">{children}</main>
    </div>
  );
}
