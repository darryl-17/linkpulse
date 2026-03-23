import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkPulse — Smart URL Shortener & Analytics",
  description:
    "Shorten URLs, track clicks, and analyze traffic with LinkPulse — a lightweight URL shortener with a built-in analytics API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
