/**
 * utils.ts
 * Shared utility functions for LinkPulse.
 */

/**
 * Validate that a string is a proper HTTP/HTTPS URL.
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Sanitize a URL — trim whitespace, ensure protocol prefix.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/**
 * Format a large number with K/M suffixes.
 * e.g. 1500 → "1.5K", 2_000_000 → "2M"
 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

/**
 * Truncate a URL for display purposes.
 */
export function truncateUrl(url: string, maxLength = 60): string {
  if (url.length <= maxLength) return url;
  return url.slice(0, maxLength) + "…";
}
