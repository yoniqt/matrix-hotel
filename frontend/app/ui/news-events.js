"use client";

import { useRef, useState } from "react";
import { useLanguage } from "../language-provider";

const NEWS_EVENTS = [
  {
    id: 1,
    tag: "01 / NIGHTLIFE",
    date: "OCT 16",
    title: "Neon & Beats Rooftop Party",
    desc: "Refresh your night with renowned guest DJs, mesmerizing neon lighting transitions, and free-flowing crafted cocktails.",
    image: "/images/events/rooftop.jpg",
    location: "Rooftop, 16th Floor",
    time: "9:00 PM – 1:00 AM",
    highlights: [
      "Live sets from 3 guest DJs",
      "Signature neon cocktail menu",
      "Smart casual dress code",
    ],
  },
  {
    id: 2,
    tag: "02 / CULINARY",
    date: "OCT 28",
    title: "Elegance Wine Tasting Soirée",
    desc: "An intimate evening for wine connoisseurs. Savor world-class vintage wines paired with artisan cheeses.",
    image: "/images/events/wine.jpg",
    location: "The Cellar Room, 2nd Floor",
    time: "7:00 PM – 10:00 PM",
    highlights: [
      "6 world-class vintage wines",
      "Curated artisan cheese pairings",
      "Limited to 30 guests",
    ],
  },
  {
    id: 3,
    tag: "03 / WELLNESS",
    date: "NOV 05",
    title: "Mindfulness & Spa Retreat",
    desc: "Reset your mind and body with a full day of sound healing meditation, premium aromatherapy, and organic herbal high tea.",
    image: "/images/events/spa-retreat.jpg",
    location: "Wellness Spa, 3rd Floor",
    time: "8:00 AM – 5:00 PM",
    highlights: [
      "Guided sound healing meditation",
      "Premium aromatherapy session",
      "Organic herbal high tea included",
    ],
  },
  {
    id: 4,
    tag: "04 / FAMILY",
    date: "NOV 15",
    title: "Family Fun Weekend Getaway",
    desc: "A fun-filled weekend for the whole family - with games, movie night, and a delicious family-style dinner everyone is sure to love.",
    image: "/images/events/family-weekend.jpg",
    location: "Hotel Lobby & Function Hall",
    time: "All Weekend",
    highlights: [
      "Kids' game corner",
      "Outdoor movie night",
      "Family-style buffet dinner",
    ],
  },
  {
    id: 5,
    tag: "05 / FITNESS",
    date: "NOV 22",
    title: "Sunrise Yoga & Fitness Bootcamp",
    desc: "Start your morning right with a refreshing yoga session and a high-energy fitness bootcamp led by our certified trainers.",
    image: "/images/events/yoga.jpg",
    location: "Fitness Studio, 2nd Floor",
    time: "6:00 AM – 8:00 AM",
    highlights: [
      "Certified yoga instructor",
      "High-energy bootcamp circuit",
      "Complimentary post-workout smoothies",
    ],
  },
  {
    id: 6,
    tag: "06 / SEASONAL",
    date: "DEC 31",
    title: "Countdown to New Year Gala",
    desc: "Welcome the new year with a live band, a dazzling fireworks display, and an unforgettable gala dinner.",
    image: "/images/hero/exterior.jpg",
    location: "Rooftop Pool Deck",
    time: "8:00 PM – 1:00 AM",
    highlights: [
      "Live band performance",
      "Rooftop fireworks viewing",
      "5-course gala dinner",
    ],
  },
];

export default function NewsEvents() {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

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
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-6 shadow-sm sm:p-10">
        <h2 className="text-center text-2xl font-semibold tracking-wide text-[var(--text-primary)] uppercase">
          {t("newsEvents")}
        </h2>

        <div className="mt-10 flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="mt-24 hidden shrink-0 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-xl text-[var(--text-secondary)] backdrop-blur-sm transition-all hover:bg-[var(--accent-color)] hover:text-black sm:flex"
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
                  className="w-[85%] shrink-0 snap-start overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] sm:w-[calc((100%-4rem)/3)]"
                >
                  <div className="group relative aspect-[16/10] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold tracking-wide text-amber-300 backdrop-blur-sm">
                      {item.date}
                    </span>
                  </div>

                  <div className="p-4">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent-strong)] uppercase">
                      {item.tag}
                    </p>
                    <h3 className="mt-2 text-xl font-bold tracking-wide text-[var(--text-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">
                      {item.desc}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(item)}
                      className="group/link mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-color)]"
                    >
                      <span>{t("viewDetails")}</span>
                      <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                        →
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Next"
            className="mt-24 hidden shrink-0 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-xl text-[var(--text-secondary)] backdrop-blur-sm transition-all hover:bg-[var(--accent-color)] hover:text-black sm:flex"
          >
            ›
          </button>
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]">
            <button
              onClick={() => setSelectedEvent(null)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-xl leading-none text-white backdrop-blur transition-colors hover:bg-black/70"
            >
              ×
            </button>
            <img
              src={selectedEvent.image}
              alt={selectedEvent.title}
              className="h-72 w-full object-cover"
            />
            <div className="p-8">
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent-strong)] uppercase">
                {selectedEvent.tag}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
                {selectedEvent.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                📍 {selectedEvent.location}
              </p>

              <p className="mt-4 text-[var(--text-secondary)]">
                {selectedEvent.desc}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Date
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {selectedEvent.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    Time
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {selectedEvent.time}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Highlights
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {selectedEvent.highlights.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-[var(--text-secondary)]"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-color)]" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
