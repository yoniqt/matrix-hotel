"use client";

import { useState } from "react";
import { CURRENCIES } from "../../lib/currency";
import { useCurrency } from "../currency-provider";
import { useLanguage } from "../language-provider";
import { TRANSLATIONS } from "../../lib/translations";

const LANGUAGES = Object.keys(TRANSLATIONS);

export default function TopSelectors() {
  const { currency, setCurrency } = useCurrency();
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(null); // "language" | "currency" | null
  const [search, setSearch] = useState("");

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );
  const filteredLanguages = LANGUAGES.filter((l) =>
    l.toLowerCase().includes(search.toLowerCase())
  );

  function toggle(panel) {
    setSearch("");
    setOpen((prev) => (prev === panel ? null : panel));
  }

  return (
    <div className="relative flex items-center gap-3">
      <button
        onClick={() => toggle("language")}
        aria-label="Select language"
        className="text-base"
      >
        🌐
      </button>
      <button
        onClick={() => toggle("currency")}
        className="text-xs font-semibold tracking-wide"
      >
        {currency.code}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-30 mt-2 w-64 rounded-xl bg-white p-4 text-left shadow-2xl">
          <p className="font-semibold text-zinc-900">
            {open === "language" ? "Select Language" : "Select Currency"}
          </p>
          <input
            autoFocus
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
          />
          <div className="mt-2 max-h-56 overflow-y-auto">
            {open === "language" &&
              filteredLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang);
                    setOpen(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    lang === language
                      ? "bg-zinc-100 font-semibold text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {lang}
                  {lang === language && <span>✓</span>}
                </button>
              ))}

            {open === "currency" &&
              filteredCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCurrency(c);
                    setOpen(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${
                    c.code === currency.code
                      ? "bg-zinc-100 font-semibold text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {c.code} {c.name}
                  {c.code === currency.code && <span>✓</span>}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
