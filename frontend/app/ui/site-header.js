"use client";

import { useState } from "react";
import Link from "next/link";
import TopSelectors from "./top-selectors";
import { useLanguage } from "../language-provider";
import { useTheme } from "../theme-provider";

export default function SiteHeader() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <Link href="/" className="text-xl font-semibold italic">
          The Matrix Hotel
        </Link>
        <div className="hidden gap-8 text-sm font-medium sm:flex">
          <Link href="/" className="hover:text-[var(--accent-color)]">
            {t("home")}
          </Link>
          <Link href="/about" className="hover:text-[var(--accent-color)]">
            {t("about")}
          </Link>
          <Link href="/rooms" className="hover:text-[var(--accent-color)]">
            {t("rooms")}
          </Link>
          <Link href="/#site-footer" className="hover:text-[var(--accent-color)]">
            {t("contact")}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          className="flex flex-col gap-1.5 sm:hidden"
        >
          <span className="h-0.5 w-6 bg-[var(--text-primary)]" />
          <span className="h-0.5 w-6 bg-[var(--text-primary)]" />
          <span className="h-0.5 w-6 bg-[var(--text-primary)]" />
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-[var(--border-color)] px-8 py-4 text-sm font-medium sm:hidden">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[var(--accent-color)]"
          >
            {t("home")}
          </Link>
          <Link
            href="/about"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[var(--accent-color)]"
          >
            {t("about")}
          </Link>
          <Link
            href="/rooms"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[var(--accent-color)]"
          >
            {t("rooms")}
          </Link>
          <Link
            href="/#site-footer"
            onClick={() => setMenuOpen(false)}
            className="hover:text-[var(--accent-color)]"
          >
            {t("contact")}
          </Link>
        </div>
      )}
    </header>
  );
}
