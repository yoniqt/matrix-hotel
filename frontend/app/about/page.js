import SiteHeader from "../ui/site-header";
import Footer from "../ui/footer";

const MILESTONES = [
  {
    year: "2010",
    title: "Our Beginning",
    text: "The Matrix Hotel opened its doors in Bonifacio Global City with a single promise: comfort without compromise. What started as a boutique property quickly became known for its warm, attentive service.",
  },
  {
    year: "2015",
    title: "The Rooftop Era",
    text: "We opened our rooftop bar and infinity pool, transforming the top floor into the city's favorite place to watch the sun set - and turning a stay at The Matrix Hotel into an experience, not just a night's rest.",
  },
  {
    year: "2020",
    title: "A Full Renovation",
    text: "Every room was reimagined from the ground up - new furnishings, upgraded bathrooms, and a design language built around calm, modern luxury that still defines the hotel today.",
  },
  {
    year: "2026",
    title: "Today",
    text: "Standard, Deluxe, Suite, and Family rooms, a rooftop bar, an infinity pool, and a team that still treats every guest like the first one. The story continues.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-strong)] uppercase">
          Our Story
        </p>
        <h1 className="mt-4 text-4xl font-bold text-[var(--text-primary)] sm:text-5xl">
          A Legacy of Timeless Hospitality
        </h1>
        <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-[var(--text-secondary)]">
          From a single boutique property to a full luxury destination -
          here&apos;s how The Matrix Hotel came to be.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-24">
        <div className="flex flex-col gap-10 border-l border-[var(--border-color)] pl-8">
          {MILESTONES.map((m) => (
            <div key={m.year} className="relative">
              <span className="absolute top-1.5 -left-[38px] h-3 w-3 rounded-full bg-[var(--accent-color)]" />
              <p className="text-xs font-semibold tracking-[0.2em] text-[var(--accent-strong)] uppercase">
                {m.year}
              </p>
              <h2 className="mt-2 text-xl font-bold text-[var(--text-primary)]">
                {m.title}
              </h2>
              <p className="mt-2 leading-relaxed text-[var(--text-secondary)]">
                {m.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
