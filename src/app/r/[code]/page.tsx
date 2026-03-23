/**
 * /r/[code] — Server-side redirect page.
 * Records the click and redirects immediately.
 */

import { redirect, notFound } from "next/navigation";
import { getLink, recordClick } from "@/lib/store";
import { headers } from "next/headers";

interface Props {
  params: { code: string };
}

export default async function RedirectPage({ params }: Props) {
  const { code } = params;
  const record = getLink(code);

  if (!record) {
    notFound();
  }

  // Log click from server-side (headers available via next/headers)
  const headersList = await headers();
  const referrer = headersList.get("referer") ?? null;
  const userAgent = headersList.get("user-agent") ?? null;
  recordClick(code, referrer, userAgent);

  redirect(record.originalUrl);
}
