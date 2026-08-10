"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import TopSelectors from "./top-selectors";
import { useLanguage } from "../language-provider";
import { useTheme } from "../theme-provider";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/rooms", key: "rooms" },
  { href: "/#site-footer", key: "contact" },
];

export default function SiteHeader() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Contact is an anchor on the home page, not a distinct route, so it
  // can't be told apart from Home by pathname alone - it never gets the
  // active state.
  function isActive(href) {
    if (href === "/") return pathname === "/";
    if (href === "/#site-footer") return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function linkClass(href) {
    return isActive(href)
      ? "rounded-full bg-[var(--border-color)] px-3 py-1 text-[var(--accent-color)]"
      : "rounded-full px-3 py-1 hover:text-[var(--accent-color)]";
  }

  return (
    <header className="relative z-20 bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <div className="flex items-center justify-between px-8 py-2 text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-4">
          <span>{t("contactUs")}</span>
          <span>📞 +63 900 000 0000</span>
          <span className="hidden sm:inline">✉️ stay@thematrixhotel.com</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
          <TopSelectors />
        </div>
      </div>

      <nav className="flex items-center justify-between border-t border-[var(--border-color)] px-8 py-4">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="order-first flex flex-col gap-1.5 sm:hidden"
        >
          <span className="h-0.5 w-6 bg-[var(--text-primary)]" />
          <span className="h-0.5 w-6 bg-[var(--text-primary)]" />
          <span className="h-0.5 w-6 bg-[var(--text-primary)]" />
        </button>

        <Link href="/" className="text-xl font-semibold italic">
          The Matrix Hotel
        </Link>

        <div className="hidden gap-2 text-sm font-medium sm:flex">
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {t(key)}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-2 border-t border-[var(--border-color)] px-8 py-4 text-sm font-medium sm:hidden">
          {NAV_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={linkClass(href)}
            >
              {t(key)}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
