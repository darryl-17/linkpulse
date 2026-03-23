# LinkPulse ⚡

**Smart URL Shortener & Analytics API**

> Built for the Remote Hustle Developers Challenge (RHDC) — Stage 1: Open Build Challenge

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/linkpulse)

---

## What is LinkPulse?

LinkPulse is a full-stack URL shortener with a built-in analytics API. Paste a long URL, get a short link, and track every click — timestamp, referrer, and device type — all accessible via a clean REST API.

No account required. No third-party trackers. Fully open source.

---

## Features

- **URL Shortening** — 7-character random code or a custom slug you define
- **Instant Redirect** — Short links redirect with click logging on every hit
- **Analytics API** — Per-link click history: timestamps, referrers, user agents
- **Link Dashboard** — Visual interface with live-refreshing stats
- **API Docs Page** — Interactive docs with cURL examples, built into the app
- **Custom Codes** — Define your own memorable short code (e.g. `/r/my-brand`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ID Generation | nanoid v5 |
| Storage | In-memory singleton (dev) |
| Deployment | Vercel |

---

## API Endpoints

### `POST /api/shorten`
Shorten a URL.

**Body:**
```json
{
  "url": "https://example.com/very/long/path",
  "customCode": "optional-slug"
}
```

**Response:**
```json
{
  "code": "ab12Xkp",
  "shortUrl": "https://your-domain.vercel.app/r/ab12Xkp",
  "originalUrl": "https://example.com/very/long/path",
  "createdAt": "2024-07-01T12:00:00.000Z"
}
```

---

### `GET /api/r/:code`
Redirects to the original URL and records a click event.

---

### `GET /api/analytics/:code`
Returns full analytics for a short link.

**Response:**
```json
{
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
}
```

---

### `GET /api/links`
List all shortened links with click counts.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/linkpulse.git
cd linkpulse

# 2. Install dependencies
npm install

# 3. Copy env example
cp .env.example .env.local

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or click the **Deploy** button at the top of this README.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── shorten/route.ts      # POST — shorten a URL
│   │   ├── r/[code]/route.ts     # GET  — API-level redirect
│   │   ├── analytics/[code]/route.ts  # GET — click analytics
│   │   └── links/route.ts        # GET  — list all links
│   ├── r/[code]/page.tsx         # Browser redirect page
│   ├── dashboard/page.tsx        # Analytics dashboard UI
│   ├── docs/page.tsx             # API documentation UI
│   ├── layout.tsx
│   ├── page.tsx                  # Homepage + shorten form
│   ├── globals.css
│   └── not-found.tsx
└── lib/
    ├── store.ts                  # In-memory data store
    └── utils.ts                  # Validation + helpers
```

---

## Built By

**Darryl Wassi** — Developer, IT Manager, RHDC Stage 1 Participant

---

*Quality > Complexity.*
