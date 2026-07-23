"use client";

import { memo } from "react";

interface TopBarProps {
  currentTitle: string;
  index: number;
  total: number;
  nextTitle: string | null;
  shuffle: boolean;
  repeat: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
}

function TopBarComponent({
  currentTitle,
  index,
  total,
  nextTitle,
  shuffle,
  repeat,
  onToggleShuffle,
  onToggleRepeat,
}: TopBarProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gradient-to-b from-black/90 via-black/55 to-transparent px-4 pb-16 pt-4 sm:px-6">
      <div className="pointer-events-auto flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 animate-fade-in">
          <p className="font-display text-xs uppercase tracking-[0.28em] text-netflix-red">
            CGP Delhi
          </p>
          <h1 className="mt-1 truncate font-display text-xl font-semibold text-white sm:text-2xl">
            {currentTitle || "No video"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
            <span>
              Video {total > 0 ? index + 1 : 0} of {total}
            </span>
            <span className="hidden text-white/30 sm:inline">•</span>
            <span className="truncate">
              Next: {nextTitle ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusChip
            active={shuffle}
            onClick={onToggleShuffle}
            label={shuffle ? "Shuffle On" : "Shuffle Off"}
          />
          <StatusChip
            active={repeat}
            onClick={onToggleRepeat}
            label={repeat ? "Repeat On" : "Repeat Off"}
          />
        </div>
      </div>
    </header>
  );
}

function StatusChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium tracking-wide transition-all duration-200 ${
        active
          ? "border-netflix-red/70 bg-netflix-red/20 text-white shadow-[0_0_20px_rgba(229,9,20,0.25)]"
          : "border-white/15 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export const TopBar = memo(TopBarComponent);
