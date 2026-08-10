"use client";

import { useEffect, useState } from "react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-color)] text-xl font-bold text-black shadow-lg transition-opacity hover:opacity-90"
    >
      ↑
    </button>
  );
}
