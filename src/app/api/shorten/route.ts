/**
 * POST /api/shorten
 * Body: { url: string, customCode?: string }
 * Returns: { code, shortUrl, originalUrl, createdAt }
 */

import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createLink, codeExists } from "@/lib/store";
import { isValidUrl, sanitizeUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const { url, customCode } = body as { url?: string; customCode?: string };

  // --- Validate input ---
  if (!url || typeof url !== "string") {
    return NextResponse.json(
      { error: "Missing required field: url" },
      { status: 400 }
    );
  }

  const sanitized = sanitizeUrl(url);

  if (!isValidUrl(sanitized)) {
    return NextResponse.json(
      { error: "Invalid URL. Must start with http:// or https://" },
      { status: 422 }
    );
  }

  // --- Determine code ---
  let code: string;

  if (customCode) {
    const clean = customCode.trim();
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(clean)) {
      return NextResponse.json(
        {
          error:
            "Custom code must be 3–20 characters and contain only letters, numbers, hyphens, or underscores.",
        },
        { status: 422 }
      );
    }
    if (codeExists(clean)) {
      return NextResponse.json(
        { error: `Custom code "${clean}" is already taken.` },
        { status: 409 }
      );
    }
    code = clean;
  } else {
    // Generate a unique 7-character code
    do {
      code = nanoid(7);
    } while (codeExists(code));
  }

  const record = createLink(code, sanitized);

  const baseUrl = req.nextUrl.origin;
  const shortUrl = `${baseUrl}/r/${code}`;

  return NextResponse.json(
    {
      code: record.code,
      shortUrl,
      originalUrl: record.originalUrl,
      createdAt: record.createdAt,
    },
    { status: 201 }
  );
}
