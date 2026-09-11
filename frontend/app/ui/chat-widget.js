"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "../language-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// How many prior messages to send back as context - keeps the request
// small and matches the backend's history validation cap.
const HISTORY_LIMIT = 8;

export default function ChatWidget() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: t("chatGreeting") }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  if (pathname?.startsWith("/admin")) return null;

  async function handleSend(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const history = messages.slice(-HISTORY_LIMIT).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.success ? data.reply : t("chatError"),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("chatError") },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-6 right-24 z-40 flex h-[28rem] max-h-[70vh] w-80 flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-tertiary)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {t("chatTitle")}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-color)]"
            >
              ✕
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <p
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-[var(--accent-color)] text-black"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <p className="rounded-2xl bg-[var(--bg-tertiary)] px-3 py-2 text-sm text-[var(--text-secondary)]">
                  {t("chatThinking")}
                </p>
              </div>
            )}
          </div>

          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 border-t border-[var(--border-color)] p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chatPlaceholder")}
              className="flex-1 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t("chatSend")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-color)] text-black transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("chatButtonLabel")}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-color)] text-xl text-black shadow-lg transition-opacity hover:opacity-90"
      >
        {open ? "✕" : "💬"}
      </button>
    </>
  );
}
