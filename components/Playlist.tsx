"use client";

import { memo, useEffect, useRef } from "react";
import type { VideoItem } from "@/types/video";
import { formatBytes } from "@/lib/format";

interface PlaylistProps {
  videos: VideoItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
}

function PlaylistComponent({ videos, currentIndex, onSelect }: PlaylistProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [currentIndex]);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-l border-white/10 bg-black/60 backdrop-blur-md lg:w-[340px]">
      <div className="border-b border-white/10 px-4 py-4">
        <h2 className="font-display text-sm uppercase tracking-[0.22em] text-white/80">
          Playlist
        </h2>
        <p className="mt-1 text-xs text-white/45">
          {videos.length} video{videos.length === 1 ? "" : "s"} from ./downloads
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
        <ul className="space-y-1">
          {videos.map((video, i) => {
            const active = i === currentIndex;
            return (
              <li key={video.filename}>
                <button
                  ref={active ? activeRef : undefined}
                  type="button"
                  onClick={() => onSelect(i)}
                  className={`group flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 ${
                    active
                      ? "bg-netflix-red/20 ring-1 ring-netflix-red/50"
                      : "hover:bg-white/8"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                      active
                        ? "bg-netflix-red text-white"
                        : "bg-white/10 text-white/60 group-hover:bg-white/15 group-hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-sm ${
                        active ? "font-semibold text-white" : "text-white/80"
                      }`}
                    >
                      {video.filename}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-white/40">
                      {formatBytes(video.size)}
                    </span>
                  </span>
                  {active && (
                    <span className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-netflix-red">
                      <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-netflix-red" />
                      Playing
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}

export const Playlist = memo(PlaylistComponent);
