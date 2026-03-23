"use client";

import { useState } from "react";
import Link from "next/link";
import { truncateUrl } from "@/lib/utils";

interface ShortenResult {
  code: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleShorten() {
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          ...(showCustom && customCode.trim()
            ? { customCode: customCode.trim() }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleShorten();
  }

  return (
    <main className="min-h-screen bg-ink flex flex-col">
      {/* NAV */}
      <nav className="border-b border-wire flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pulse animate-pulse-slow" />
          <span className="font-display font-bold text-snow text-lg tracking-tight">
            Link<span className="text-pulse">Pulse</span>
          </span>
        </div>
        <div className="flex items-center gap-6 text-sm font-mono text-ghost">
          <Link href="/dashboard" className="hover:text-pulse transition-colors">
            dashboard →
          </Link>
          <Link href="/docs" className="hover:text-pulse transition-colors">
            api docs →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 pt-16 pb-8 text-center">
        <div className="inline-flex items-center gap-2 border border-wire rounded-full px-4 py-1.5 mb-8 text-xs font-mono text-ghost">
          <span className="w-1.5 h-1.5 rounded-full bg-pulse" />
          v1.0 — Open Build Challenge · RHDC Stage 1
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl text-snow leading-tight mb-4 max-w-3xl">
          Shorten. Track.{" "}
          <span className="text-pulse">Analyse.</span>
        </h1>

        <p className="text-ghost text-lg md:text-xl max-w-xl mb-12 font-body leading-relaxed">
          A smart URL shortener with a built-in analytics API. Paste your link.
          Get insights. No account needed.
        </p>

        {/* SHORTEN BOX */}
        <div className="w-full max-w-2xl animate-slide-up">
          <div className="bg-ink-soft border border-wire rounded-2xl p-5 shadow-2xl">
            {/* URL Input */}
            <div className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://your-very-long-url.com/goes/here"
                className="flex-1 bg-ink-muted border border-wire rounded-xl px-4 py-3 text-sm font-mono text-snow placeholder:text-ghost focus:outline-none focus:border-pulse transition-colors"
              />
              <button
                onClick={handleShorten}
                disabled={loading || !url.trim()}
                className="bg-pulse text-ink font-display font-bold px-6 py-3 rounded-xl hover:bg-pulse-dim transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap text-sm"
              >
                {loading ? "Shortening…" : "Shorten →"}
              </button>
            </div>

            {/* Custom code toggle */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setShowCustom(!showCustom)}
                className="text-xs font-mono text-ghost hover:text-fog transition-colors flex items-center gap-1"
              >
                <span>{showCustom ? "▾" : "▸"}</span>
                custom short code
              </button>
            </div>

            {showCustom && (
              <div className="mt-2 animate-fade-in">
                <div className="flex items-center gap-2 bg-ink-muted border border-wire rounded-xl px-4 py-2">
                  <span className="text-ghost text-xs font-mono">
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}/r/
                  </span>
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="my-link"
                    className="flex-1 bg-transparent text-sm font-mono text-snow placeholder:text-ghost focus:outline-none"
                  />
                </div>
                <p className="text-xs text-ghost mt-1 ml-1 font-mono">
                  3–20 chars · letters, numbers, hyphens, underscores
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm font-mono animate-fade-in">
                ✗ {error}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="mt-4 bg-pulse/5 border border-pulse/30 rounded-xl p-4 animate-slide-up">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-xs font-mono text-ghost mb-1">
                      your short link
                    </p>
                    <a
                      href={result.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pulse font-mono font-medium text-lg hover:underline"
                    >
                      {result.shortUrl}
                    </a>
                    <p className="text-xs text-ghost font-mono mt-1">
                      → {truncateUrl(result.originalUrl)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="border border-pulse/40 text-pulse text-xs font-mono px-4 py-2 rounded-lg hover:bg-pulse/10 transition-colors"
                    >
                      {copied ? "✓ Copied!" : "Copy"}
                    </button>
                    <Link
                      href={`/dashboard?highlight=${result.code}`}
                      className="border border-wire text-ghost text-xs font-mono px-4 py-2 rounded-lg hover:border-fog hover:text-fog transition-colors"
                    >
                      Analytics
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FEATURES */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl w-full px-4">
          {[
            {
              icon: "⚡",
              title: "Instant Shortening",
              desc: "Paste any URL and get a short link in milliseconds via our REST API.",
            },
            {
              icon: "📊",
              title: "Click Analytics",
              desc: "Track every click — timestamp, referrer, and user agent. Accessible via API.",
            },
            {
              icon: "🔗",
              title: "Custom Codes",
              desc: "Define your own slug for memorable, branded short links.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-ink-soft border border-wire rounded-2xl p-5 text-left hover:border-wire-bright transition-colors"
            >
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-display font-semibold text-snow mb-2">
                {f.title}
              </h3>
              <p className="text-ghost text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-wire px-6 py-4 flex items-center justify-between text-xs font-mono text-ghost">
        <span>
          Built by{" "}
          <span className="text-fog">Darryl Wassi</span> · RHDC Stage 1
        </span>
        <span>LinkPulse v1.0</span>
      </footer>
    </main>
  );
}
