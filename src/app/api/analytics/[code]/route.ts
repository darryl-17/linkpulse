/**
 * GET /api/analytics/[code]
 * Returns click analytics for a given short code.
 *
 * Response: {
 *   code, originalUrl, createdAt,
 *   totalClicks,
 *   clicks: [{ timestamp, referrer, userAgent }]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getLink } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  // Next.js may provide `params` as a Promise in this runtime.
  const { code } = await params;
  const record = getLink(code);

  if (!record) {
    return NextResponse.json(
      { error: `Short code "${code}" not found.` },
      { status: 404 }
    );
  }

  const clicks = Array.isArray(record.clicks) ? record.clicks : [];

  return NextResponse.json({
    code: record.code,
    originalUrl: record.originalUrl,
    createdAt: record.createdAt,
    totalClicks: clicks.length,
    clicks,
  });
}
