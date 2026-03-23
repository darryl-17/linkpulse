/**
 * GET /api/r/[code]
 * Redirects the user to the original URL and logs the click.
 */

import { NextRequest, NextResponse } from "next/server";
import { getLink, recordClick } from "@/lib/store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const record = getLink(code);

  if (!record) {
    return NextResponse.json(
      { error: `Short code "${code}" not found.` },
      { status: 404 }
    );
  }

  // Log click metadata
  const referrer = req.headers.get("referer") ?? null;
  const userAgent = req.headers.get("user-agent") ?? null;
  recordClick(code, referrer, userAgent);

  return NextResponse.redirect(record.originalUrl, { status: 302 });
}
