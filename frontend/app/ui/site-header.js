"use client";

import Link from "next/link";
import TopSelectors from "./top-selectors";
import { useLanguage } from "../language-provider";

export default function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="relative z-20 bg-zinc-900 text-white">
      <div className="flex items-center justify-between px-8 py-2 text-xs text-zinc-300">
        <div className="flex items-center gap-4">
          <span>📞 +63 900 000 0000</span>
          <span className="hidden sm:inline">✉️ stay@thematrixhotel.com</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{t("contactUs")}</span>
          <TopSelectors />
        </div>
      </div>

      <nav className="flex items-center justify-between border-t border-white/10 px-8 py-4">
        <Link href="/" className="text-xl font-semibold italic">
          The Matrix Hotel
        </Link>
        <div className="hidden gap-8 text-sm font-medium sm:flex">
          <span>{t("home")}</span>
          <span>{t("about")}</span>
          <span>{t("rooms")}</span>
          <span>{t("contact")}</span>
        </div>
      </nav>
    </header>
  );
}
