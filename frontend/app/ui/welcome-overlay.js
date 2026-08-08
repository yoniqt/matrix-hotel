"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Cormorant_Garamond } from "next/font/google";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
});

const EASE = [0.22, 1, 0.36, 1];

export default function WelcomeOverlay({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="welcome-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-b from-zinc-950 via-black to-zinc-950"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.10),transparent_60%)]" />

          <div className="relative flex flex-col items-center px-6 text-center">
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, letterSpacing: "0.4em" }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
              className="text-[10px] font-medium uppercase text-amber-300/80 sm:text-xs"
            >
              The Matrix Hotel
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 0.5 }}
              className={`${serif.className} mt-5 bg-gradient-to-b from-amber-100 via-amber-300 to-amber-500 bg-clip-text text-4xl italic tracking-wide text-transparent sm:text-6xl`}
            >
              Welcome to Matriz Hotel
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.9, ease: EASE, delay: 1.05 }}
              className="mt-7 h-px w-24 origin-center bg-gradient-to-r from-transparent via-amber-400 to-transparent"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
