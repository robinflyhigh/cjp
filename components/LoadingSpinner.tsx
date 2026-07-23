"use client";

export function LoadingSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 text-white"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-white/15" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-netflix-red border-r-netflix-red/40" />
      </div>
      <p className="text-sm tracking-wide text-white/70">{label}</p>
    </div>
  );
}
