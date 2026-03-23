"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatCount, truncateUrl } from "@/lib/utils";

interface LinkSummary {
  code: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  totalClicks: number;
}

interface ClickEvent {
  timestamp: string;
  referrer: string | null;
  userAgent: string | null;
}

interface AnalyticsData {
  code: string;
  originalUrl: string;
  createdAt: string;
  totalClicks: number;
  clicks: ClickEvent[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function parseDevice(ua: string | null): string {
  if (!ua) return "Unknown";
  if (/mobile/i.test(ua)) return "📱 Mobile";
  if (/tablet|ipad/i.test(ua)) return "📲 Tablet";
  return "🖥 Desktop";
}

export default function DashboardPage() {
  const [links, setLinks] = useState<LinkSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchLinks = useCallback(async () => {
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      setLinks(Array.isArray(data.links) ? data.links : []);
    } catch {
      // silent fail — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
    const interval = setInterval(fetchLinks, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, [fetchLinks]);

  useEffect(() => {
    // Auto-select highlighted link from homepage
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get("highlight");
    if (highlight) setSelected(highlight);
  }, []);

  useEffect(() => {
    if (!selected) {
      setAnalytics(null);
      setAnalyticsLoading(false);
      return;
    }
    setAnalyticsLoading(true);

    (async () => {
      try {
        const res = await fetch(`/api/analytics/${selected}`);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data || !Array.isArray(data.clicks)) {
          setAnalytics(null);
          return;
        }

        setAnalytics({
          code: typeof data.code === "string" ? data.code : selected,
          originalUrl:
            typeof data.originalUrl === "string" ? data.originalUrl : "",
          createdAt:
            typeof data.createdAt === "string"
              ? data.createdAt
              : new Date().toISOString(),
          totalClicks:
            typeof data.totalClicks === "number"
              ? data.totalClicks
              : data.clicks.length,
          clicks: data.clicks as ClickEvent[],
        });
      } catch {
        setAnalytics(null);
      } finally {
        setAnalyticsLoading(false);
      }
    })();
  }, [selected]);

  function copyLink(shortUrl: string, code: string) {
    navigator.clipboard.writeText(shortUrl).then(() => {
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const filtered = links.filter(
    (l) =>
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.originalUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-ink flex flex-col">
      {/* NAV */}
      <nav className="border-b border-wire flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pulse animate-pulse-slow" />
          <span className="font-display font-bold text-snow text-lg tracking-tight">
            Link<span className="text-pulse">Pulse</span>
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-mono text-ghost">
          <span className="text-pulse">dashboard</span>
          <Link href="/docs" className="hover:text-pulse transition-colors">
            api docs →
          </Link>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL — link list */}
        <aside className="w-full md:w-96 border-r border-wire flex flex-col shrink-0">
          {/* Header */}
          <div className="px-5 py-4 border-b border-wire">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-snow text-lg">
                All Links
              </h2>
              <span className="text-xs font-mono bg-ink-muted border border-wire px-2 py-1 rounded-full text-ghost">
                {links.length} total
              </span>
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links…"
              className="w-full bg-ink-muted border border-wire rounded-xl px-4 py-2.5 text-sm font-mono text-snow placeholder:text-ghost focus:outline-none focus:border-pulse transition-colors"
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32 text-ghost font-mono text-sm">
                <span className="animate-pulse">Loading…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-ghost text-sm font-mono px-6 text-center gap-3">
                <span className="text-3xl">🔗</span>
                {search
                  ? "No links match your search."
                  : "No links yet. Shorten your first URL on the homepage."}
                {!search && (
                  <Link
                    href="/"
                    className="text-pulse hover:underline text-xs mt-1"
                  >
                    → Go shorten something
                  </Link>
                )}
              </div>
            ) : (
              filtered.map((link) => (
                <div
                  key={link.code}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setSelected(selected === link.code ? null : link.code)
                  }
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    e.preventDefault();
                    setSelected(selected === link.code ? null : link.code);
                  }}
                  className={`w-full text-left px-5 py-4 border-b border-wire hover:bg-ink-muted transition-colors group ${
                    selected === link.code ? "bg-ink-muted border-l-2 border-l-pulse" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-pulse text-sm font-medium">
                          /{link.code}
                        </span>
                        <span className="text-xs font-mono bg-pulse/10 text-pulse-dim px-1.5 py-0.5 rounded">
                          {formatCount(link.totalClicks)} clicks
                        </span>
                      </div>
                      <p className="text-ghost text-xs font-mono truncate">
                        {truncateUrl(link.originalUrl, 45)}
                      </p>
                      <p className="text-wire-bright text-xs font-mono mt-1">
                        {timeAgo(link.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLink(link.shortUrl, link.code);
                      }}
                      className="shrink-0 text-ghost hover:text-pulse text-xs font-mono border border-wire rounded-lg px-2.5 py-1.5 hover:border-pulse transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === link.code ? "✓" : "copy"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer action */}
          <div className="border-t border-wire p-4">
            <Link
              href="/"
              className="block w-full text-center bg-pulse text-ink font-display font-bold py-2.5 rounded-xl text-sm hover:bg-pulse-dim transition-colors"
            >
              + Shorten New URL
            </Link>
          </div>
        </aside>

        {/* RIGHT PANEL — analytics detail */}
        <section className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-ghost font-mono gap-4">
              <div className="text-6xl opacity-30">📊</div>
              <p className="text-lg">Select a link to view analytics</p>
              <p className="text-xs text-wire-bright">
                Click any link in the list to inspect its click data
              </p>
            </div>
          ) : analyticsLoading ? (
            <div className="h-full flex items-center justify-center text-ghost font-mono text-sm animate-pulse">
              Loading analytics…
            </div>
          ) : analytics ? (
            <div className="max-w-2xl animate-slide-up">
              {/* Top summary */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-display font-bold text-snow text-2xl">
                    /{analytics.code}
                  </span>
                  <span className="text-xs font-mono bg-pulse/10 text-pulse border border-pulse/20 px-2 py-1 rounded-full">
                    {formatCount(analytics.totalClicks)} clicks
                  </span>
                </div>
                <p className="text-ghost text-sm font-mono break-all">
                  → {analytics.originalUrl}
                </p>
                <p className="text-xs text-wire-bright font-mono mt-1">
                  Created {new Date(analytics.createdAt).toLocaleString()}
                </p>
              </div>

              {/* API access hint */}
              <div className="bg-ink-muted border border-wire rounded-xl p-4 mb-6">
                <p className="text-xs font-mono text-ghost mb-2">
                  API endpoint
                </p>
                <code className="text-pulse text-sm font-mono break-all">
                  GET /api/analytics/{analytics.code}
                </code>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  {
                    label: "Total Clicks",
                    value: formatCount(analytics.totalClicks),
                    icon: "🖱",
                  },
                  {
                    label: "Last Click",
                    value:
                      analytics.clicks.length > 0
                        ? timeAgo(
                            analytics.clicks[analytics.clicks.length - 1]
                              .timestamp
                          )
                        : "—",
                    icon: "🕐",
                  },
                  {
                    label: "Referrers",
                    value: String(
                      new Set(
                        analytics.clicks
                          .map((c) => c.referrer)
                          .filter(Boolean)
                      ).size
                    ),
                    icon: "🔀",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-ink-soft border border-wire rounded-xl p-4"
                  >
                    <div className="text-xl mb-2">{stat.icon}</div>
                    <div className="font-display font-bold text-snow text-2xl">
                      {stat.value}
                    </div>
                    <div className="text-ghost text-xs font-mono mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Click log */}
              <div className="bg-ink-soft border border-wire rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-wire flex items-center justify-between">
                  <h3 className="font-display font-semibold text-snow text-sm">
                    Click History
                  </h3>
                  <span className="text-xs font-mono text-ghost">
                    {analytics.clicks.length} events
                  </span>
                </div>
                {analytics.clicks.length === 0 ? (
                  <div className="px-4 py-8 text-center text-ghost font-mono text-sm">
                    No clicks yet. Share your link to start tracking.
                  </div>
                ) : (
                  <div className="divide-y divide-wire max-h-80 overflow-y-auto">
                    {[...analytics.clicks].reverse().map((click, i) => (
                      <div
                        key={i}
                        className="px-4 py-3 flex items-start justify-between gap-4 hover:bg-ink-muted transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-mono text-snow">
                            {new Date(click.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs font-mono text-ghost mt-0.5 truncate">
                            {click.referrer ? `from: ${click.referrer}` : "direct / no referrer"}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-ghost shrink-0">
                          {parseDevice(click.userAgent)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
