import Link from "next/link";
import SiteHeader from "../ui/site-header";
import Footer from "../ui/footer";

const MILESTONES = [
  {
    year: "2010",
    title: "Our Beginning",
    text: "The Matrix Hotel opened its doors in Bonifacio Global City with a single promise: comfort without compromise. What started as a boutique property quickly became known for its warm, attentive service.",
    image: "/images/about/2010-beginning.jpg",
    alt: "The Matrix Hotel's original boutique facade at dusk",
  },
  {
    year: "2015",
    title: "The Rooftop Era",
    text: "We opened our rooftop bar and infinity pool, transforming the top floor into the city's favorite place to watch the sun set - and turning a stay at The Matrix Hotel into an experience, not just a night's rest.",
    image: "/images/about/2015-rooftop.avif",
    alt: "The rooftop infinity pool overlooking the city",
  },
  {
    year: "2020",
    title: "A Full Renovation",
    text: "Every room was reimagined from the ground up - new furnishings, upgraded bathrooms, and a design language built around calm, modern luxury that still defines the hotel today.",
    image: "/images/about/2020-renovation.jpg",
    alt: "A newly renovated Deluxe room",
  },
  {
    year: "2026",
    title: "Today",
    text: "Standard, Deluxe, Suite, and Family rooms, a rooftop bar, an infinity pool, and a team that still treats every guest like the first one. The story continues.",
    image: "/images/about/2026-today.webp",
    alt: "The hotel lobby today",
  },
];

const VALUES = [
  {
    title: "Uncompromised Comfort",
    text: "From mattress to minibar, every detail is chosen so your stay feels effortless from check-in to check-out.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect
          x="4"
          y="8"
          width="16"
          height="9"
          rx="4"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M4 12.5h16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Attentive Service",
    text: "A team that remembers your name, anticipates your needs, and treats every guest like the first one.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M12 4v2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M5 16a7 7 0 0 1 14 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M4 16h16"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12" cy="4" r="1.2" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Modern Elegance",
    text: "Calm, considered interiors that trade clutter for craft - luxury that feels timeless, not trendy.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

const STATS = [
  { value: "16+", label: "Years of Excellence" },
  { value: "14", label: "Rooms & Suites" },
  { value: "50,000+", label: "Guests Served" },
  { value: "4.9★", label: "Guest Rating" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative flex min-h-[520px] items-center justify-center overflow-hidden border-b border-[var(--border-color)]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero/lobby.webp')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.72)_45%,var(--bg-primary)_100%)]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(620px circle at 50% 35%, rgba(245,158,11,0.20), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-amber-300 uppercase">
            Our Story
          </p>
          <h1 className="text-balance mt-4 text-4xl font-bold text-white sm:text-5xl">
            A Legacy of Timeless Hospitality
          </h1>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-white/75">
            From a single boutique property to a full luxury destination -
            here&apos;s how The Matrix Hotel came to be.
          </p>
        </div>
      </section>

      {/* Timeline */}
      <section className="relative mx-auto max-w-5xl px-6 py-24">
        <div className="relative flex flex-col gap-16">
          <div className="absolute top-0 bottom-0 left-1/2 hidden w-px -translate-x-1/2 bg-[var(--border-color)] md:block" />

          {MILESTONES.map((m, i) => (
            <div
              key={m.year}
              className={`relative flex flex-col gap-8 md:flex-row md:items-center ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <span className="absolute top-1/2 left-1/2 z-10 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-color)] ring-4 ring-[var(--bg-primary)] md:block" />

              <div className="md:w-1/2">
                <img
                  src={m.image}
                  alt={m.alt}
                  className="h-56 w-full rounded-2xl border border-[var(--accent-color)]/30 object-cover shadow-lg sm:h-72"
                />
              </div>

              <div className="md:w-1/2">
                <div className="group rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-glass)] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-color)] hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                  <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent-strong)] uppercase">
                    {m.year}
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                    {m.title}
                  </h2>
                  <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">
                    {m.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-strong)] uppercase">
              Our Philosophy
            </p>
            <h2 className="text-balance mt-4 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
              What Guides Every Stay
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="group rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-glass)] p-8 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-color)] hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-color)]/10 text-[var(--accent-color)]">
                  {v.icon}
                </div>
                <h3 className="mt-5 text-base font-bold text-[var(--text-primary)]">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {v.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-6 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold tabular-nums text-[var(--accent-strong)] sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-2 text-xs font-medium tracking-wide text-[var(--text-secondary)] uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-[var(--border-color)] bg-[var(--bg-tertiary)] py-24 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(480px circle at 50% 50%, rgba(245,158,11,0.14), transparent 70%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-xl px-6">
          <h2 className="text-balance text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">
            Experience The Matrix Hotel
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
            Your room is waiting. Pick your dates and let us take care of the
            rest.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-[var(--accent-color)] px-8 py-3 font-medium text-black shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-opacity hover:opacity-90"
          >
            Book Your Stay
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
