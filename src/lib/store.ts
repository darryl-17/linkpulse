/**
 * store.ts
 * In-memory data store for LinkPulse.
 * In production, swap this with a database (Vercel KV, Supabase, etc.)
 * This module is a singleton — safe to import across API routes in development.
 */

export interface ClickEvent {
  timestamp: string;       // ISO 8601
  referrer: string | null; // HTTP Referer header or null
  userAgent: string | null;
}

export interface LinkRecord {
  code: string;        // short code, e.g. "ab12Xk"
  originalUrl: string; // the full original URL
  createdAt: string;   // ISO 8601
  clicks: ClickEvent[];
}

// Global singleton — persists across hot-reloads in dev via global scope trick
const globalStore = global as typeof global & { __linkpulse_store?: Map<string, LinkRecord> };

if (!globalStore.__linkpulse_store) {
  globalStore.__linkpulse_store = new Map<string, LinkRecord>();
}

const store = globalStore.__linkpulse_store;

/** Insert a new link record */
export function createLink(code: string, originalUrl: string): LinkRecord {
  const record: LinkRecord = {
    code,
    originalUrl,
    createdAt: new Date().toISOString(),
    clicks: [],
  };
  store.set(code, record);
  return record;
}

/** Retrieve a link by its short code */
export function getLink(code: string): LinkRecord | null {
  return store.get(code) ?? null;
}

/** Record a click event on a link */
export function recordClick(
  code: string,
  referrer: string | null,
  userAgent: string | null
): boolean {
  const record = store.get(code);
  if (!record) return false;

  record.clicks.push({
    timestamp: new Date().toISOString(),
    referrer,
    userAgent,
  });
  return true;
}

/** Return all stored links (for the dashboard) */
export function getAllLinks(): LinkRecord[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/** Check if a code already exists */
export function codeExists(code: string): boolean {
  return store.has(code);
}
