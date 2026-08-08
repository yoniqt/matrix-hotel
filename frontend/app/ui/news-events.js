"use client";

import { useRef, useState } from "react";
import { useLanguage } from "../language-provider";
import styles from "./news-events.module.css";

const NEWS_EVENTS = [
  {
    id: 1,
    tag: "01 / NIGHTLIFE",
    date: "OCT 16",
    title: "Neon & Beats Rooftop Party",
    desc: "Sariwain ang gabi kasama ang mga sikat na guest DJs, nakabibighaning neon lighting transitions, at free-flowing crafted cocktails.",
    image: "/images/events/rooftop.jpg",
  },
  {
    id: 2,
    tag: "02 / CULINARY",
    date: "OCT 28",
    title: "Elegance Wine Tasting Soirée",
    desc: "Isang intimate na gabi para sa mga wine connoisseurs. Tikman ang mga world-class vintage wines na ipinares sa mga artisan cheeses.",
    image: "/images/events/wine.jpg",
  },
  {
    id: 3,
    tag: "03 / WELLNESS",
    date: "NOV 05",
    title: "Mindfulness & Spa Retreat",
    desc: "I-reset ang iyong isip at katawan sa isang buong araw ng sound healing meditation, premium aromatherapy, at organic herbal high tea.",
    image: "/images/events/spa-retreat.jpg",
  },
  {
    id: 4,
    tag: "04 / FAMILY",
    date: "NOV 15",
    title: "Family Fun Weekend Getaway",
    desc: "Isang masayang weekend para sa buong pamilya - may mga laro, movie night, at masarap na family-style dinner na tiyak na magugustuhan ng lahat.",
    image: "/images/rooms/family.jpg",
  },
  {
    id: 5,
    tag: "05 / FITNESS",
    date: "NOV 22",
    title: "Sunrise Yoga & Fitness Bootcamp",
    desc: "Simulan ang umaga nang tama sa isang refreshing yoga session at high-energy fitness bootcamp kasama ang aming certified trainers.",
    image: "/images/amenities/gym.jpg",
  },
  {
    id: 6,
    tag: "06 / SEASONAL",
    date: "DEC 31",
    title: "Countdown to New Year Gala",
    desc: "Salubungin ang bagong taon kasama ang live band, fireworks display, at isang gala dinner na hindi malilimutan.",
    image: "/images/hero/exterior.jpg",
  },
];

export default function NewsEvents() {
  const { t } = useLanguage();
  const [theme, setTheme] = useState("dark");
  const scrollRef = useRef(null);

  function scroll(direction) {
    const el = scrollRef.current;
    if (!el) return;
    // Cards are sized so 3 cards + 2 gaps exactly fill the container's
    // width (see the sm:w-[calc((100%-4rem)/3)] card width below), so one
    // full clientWidth is exactly one page of 3 cards - not a fraction of
    // it, which was cutting cards off mid-card.
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div
        data-theme={theme}
        className={`${styles.section} rounded-2xl p-6 sm:p-10`}
      >
        <div className="flex items-center justify-between gap-4">
          <h2
            className={`${styles.heading} text-2xl font-semibold tracking-wide uppercase`}
          >
            {t("newsEvents")}
          </h2>
          <button
            type="button"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
            className={`${styles.themeToggle} rounded-full px-4 py-2 text-xs font-semibold tracking-wide uppercase transition-colors`}
          >
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className="mt-10 flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className={`${styles.arrow} mt-24 hidden shrink-0 rounded-full p-4 text-xl backdrop-blur-sm transition-all sm:flex`}
          >
            ‹
          </button>

          <div className="flex-1 overflow-hidden">
            <div
              ref={scrollRef}
              className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {NEWS_EVENTS.map((item) => (
                <div
                  key={item.id}
                  className={`${styles.card} w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[calc((100%-4rem)/3)]`}
                >
                <div className="group relative aspect-[16/10] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={`${styles.dateBadge} absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold tracking-wide backdrop-blur-sm`}
                  >
                    {item.date}
                  </span>
                </div>

                <div className="p-4">
                  <p
                    className={`${styles.tag} text-xs font-semibold tracking-[0.2em] uppercase`}
                  >
                    {item.tag}
                  </p>
                  <h3
                    className={`${styles.title} mt-2 text-xl font-bold tracking-wide`}
                  >
                    {item.title}
                  </h3>
                  <p className={`${styles.desc} mt-2 line-clamp-2 text-sm`}>
                    {item.desc}
                  </p>
                  <a
                    href="#"
                    className={`${styles.link} group/link mt-3 inline-flex items-center gap-1 text-sm font-semibold transition-colors`}
                  >
                    <span>{t("viewDetails")}</span>
                    <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                      →
                    </span>
                  </a>
                </div>
              </div>
            ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next"
            className={`${styles.arrow} mt-24 hidden shrink-0 rounded-full p-4 text-xl backdrop-blur-sm transition-all sm:flex`}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
