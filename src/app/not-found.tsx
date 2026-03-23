import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-ink flex flex-col items-center justify-center text-center px-4">
      <div className="inline-flex items-center gap-2 border border-wire rounded-full px-4 py-1.5 mb-6 text-xs font-mono text-ghost">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        404 — not found
      </div>
      <h1 className="font-display font-extrabold text-6xl text-snow mb-4">
        Dead <span className="text-red-400">Link</span>
      </h1>
      <p className="text-ghost text-lg max-w-sm mb-8">
        This short link doesn&apos;t exist or may have expired.
      </p>
      <Link
        href="/"
        className="bg-pulse text-ink font-display font-bold px-6 py-3 rounded-xl hover:bg-pulse-dim transition-colors"
      >
        ← Back to LinkPulse
      </Link>
    </main>
  );
}
