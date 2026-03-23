/**
 * GET /api/links
 * Returns all stored links with click counts (no full click history).
 * Used by the dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllLinks } from "@/lib/store";

export async function GET(req: NextRequest) {
  const links = getAllLinks();

  const baseUrl = req.nextUrl.origin;

  const payload = links.map((l) => ({
    code: l.code,
    shortUrl: `${baseUrl}/r/${l.code}`,
    originalUrl: l.originalUrl,
    createdAt: l.createdAt,
    totalClicks: l.clicks.length,
  }));

  return NextResponse.json({ total: payload.length, links: payload });
}
