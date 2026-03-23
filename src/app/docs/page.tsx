"use client";

import { useState } from "react";
import Link from "next/link";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  body?: { field: string; type: string; required: boolean; desc: string }[];
  response: string;
  example: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/shorten",
    description: "Shorten a URL and optionally set a custom short code.",
    body: [
      {
        field: "url",
        type: "string",
        required: true,
        desc: "The full URL to shorten (must start with http:// or https://)",
      },
      {
        field: "customCode",
        type: "string",
        required: false,
        desc: "Optional custom slug (3–20 chars, letters/numbers/-/_)",
      },
    ],
    response: `{
  "code": "ab12Xkp",
  "shortUrl": "https://linkpulse.vercel.app/r/ab12Xkp",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2024-07-01T12:00:00.000Z"
}`,
    example: `curl -X POST https://linkpulse.vercel.app/api/shorten \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com/very/long/path"}'`,
  },
  {
    method: "GET",
    path: "/api/r/:code",
    description:
      "Redirect to the original URL. Automatically records a click event with timestamp, referrer, and user agent.",
    response: `HTTP 302 → Redirects to original URL`,
    example: `curl -L https://linkpulse.vercel.app/api/r/ab12Xkp`,
  },
  {
    method: "GET",
    path: "/api/analytics/:code",
    description:
      "Retrieve full analytics for a short link including total clicks and detailed click history.",
    response: `{
  "code": "ab12Xkp",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2024-07-01T12:00:00.000Z",
  "totalClicks": 42,
  "clicks": [
    {
      "timestamp": "2024-07-01T13:05:22.000Z",
      "referrer": "https://twitter.com",
      "userAgent": "Mozilla/5.0 ..."
    }
  ]
}`,
    example: `curl https://linkpulse.vercel.app/api/analytics/ab12Xkp`,
  },
  {
    method: "GET",
    path: "/api/links",
    description:
      "List all shortened links with their click counts. Useful for building dashboards or integrations.",
    response: `{
  "total": 5,
  "links": [
    {
      "code": "ab12Xkp",
      "shortUrl": "https://linkpulse.vercel.app/r/ab12Xkp",
      "originalUrl": "https://example.com/...",
      "createdAt": "2024-07-01T12:00:00.000Z",
      "totalClicks": 42
    }
  ]
}`,
    example: `curl https://linkpulse.vercel.app/api/links`,
  },
];

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-blue-950/60 text-blue-400 border-blue-800",
  POST: "bg-green-950/60 text-green-400 border-green-800",
};

export default function DocsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function copyExample(index: number, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  }

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
          <Link href="/dashboard" className="hover:text-pulse transition-colors">
            dashboard →
          </Link>
          <span className="text-pulse">api docs</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto w-full px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 border border-wire rounded-full px-4 py-1.5 mb-6 text-xs font-mono text-ghost">
            <span className="w-1.5 h-1.5 rounded-full bg-pulse" />
            REST API · JSON · No Auth Required
          </div>
          <h1 className="font-display font-extrabold text-4xl text-snow mb-3">
            API Documentation
          </h1>
          <p className="text-ghost leading-relaxed">
            LinkPulse exposes a simple REST API for shortening URLs,
            redirecting, and retrieving analytics programmatically. All
            endpoints return JSON. No authentication required.
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-ink-soft border border-wire rounded-2xl p-5 mb-10">
          <p className="text-xs font-mono text-ghost mb-2">Base URL</p>
          <code className="text-pulse font-mono text-sm">
            https://linkpulse.vercel.app
          </code>
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          {ENDPOINTS.map((ep, i) => (
            <div
              key={i}
              className="bg-ink-soft border border-wire rounded-2xl overflow-hidden"
            >
              {/* Accordion header */}
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ink-muted transition-colors text-left"
              >
                <span
                  className={`font-mono text-xs font-bold px-2.5 py-1 rounded border ${
                    METHOD_STYLES[ep.method]
                  }`}
                >
                  {ep.method}
                </span>
                <code className="font-mono text-snow text-sm flex-1">
                  {ep.path}
                </code>
                <span className="text-ghost text-lg">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>

              {/* Expanded content */}
              {openIndex === i && (
                <div className="border-t border-wire px-5 py-5 space-y-5 animate-fade-in">
                  <p className="text-fog text-sm leading-relaxed">
                    {ep.description}
                  </p>

                  {/* Request body */}
                  {ep.body && ep.body.length > 0 && (
                    <div>
                      <h4 className="text-xs font-mono text-ghost uppercase tracking-widest mb-3">
                        Request Body
                      </h4>
                      <div className="space-y-2">
                        {ep.body.map((param) => (
                          <div
                            key={param.field}
                            className="bg-ink-muted rounded-xl px-4 py-3 flex items-start gap-4"
                          >
                            <code className="text-pulse font-mono text-sm shrink-0">
                              {param.field}
                            </code>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-ghost text-xs font-mono">
                                  {param.type}
                                </span>
                                <span
                                  className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                                    param.required
                                      ? "bg-red-950/50 text-red-400"
                                      : "bg-wire text-ghost"
                                  }`}
                                >
                                  {param.required ? "required" : "optional"}
                                </span>
                              </div>
                              <p className="text-fog text-xs">{param.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Response */}
                  <div>
                    <h4 className="text-xs font-mono text-ghost uppercase tracking-widest mb-3">
                      Response
                    </h4>
                    <pre className="bg-ink-muted border border-wire rounded-xl p-4 text-xs font-mono text-snow overflow-x-auto leading-relaxed">
                      {ep.response}
                    </pre>
                  </div>

                  {/* Example */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-mono text-ghost uppercase tracking-widest">
                        cURL Example
                      </h4>
                      <button
                        onClick={() => copyExample(i, ep.example)}
                        className="text-xs font-mono text-ghost hover:text-pulse border border-wire px-2.5 py-1 rounded-lg transition-colors"
                      >
                        {copiedIndex === i ? "✓ Copied" : "Copy"}
                      </button>
                    </div>
                    <pre className="bg-ink rounded-xl border border-wire p-4 text-xs font-mono text-pulse overflow-x-auto leading-relaxed">
                      {ep.example}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Error codes */}
        <div className="mt-10 bg-ink-soft border border-wire rounded-2xl p-6">
          <h2 className="font-display font-bold text-snow text-lg mb-4">
            Error Codes
          </h2>
          <div className="space-y-2">
            {[
              { code: "400", desc: "Bad Request — missing or malformed body" },
              { code: "404", desc: "Not Found — short code does not exist" },
              { code: "409", desc: "Conflict — custom code already taken" },
              { code: "422", desc: "Unprocessable — invalid URL or code format" },
            ].map((e) => (
              <div
                key={e.code}
                className="flex items-center gap-4 bg-ink-muted rounded-xl px-4 py-3"
              >
                <code className="font-mono text-red-400 text-sm font-bold w-10 shrink-0">
                  {e.code}
                </code>
                <span className="text-fog text-sm">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-wire px-6 py-4 flex items-center justify-between text-xs font-mono text-ghost mt-auto">
        <span>
          Built by <span className="text-fog">Darryl Wassi</span> · RHDC Stage 1
        </span>
        <span>LinkPulse v1.0</span>
      </footer>
    </main>
  );
}
