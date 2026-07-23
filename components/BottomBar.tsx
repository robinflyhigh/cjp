"use client";

import { memo, useCallback, useRef, type ReactNode } from "react";
import { formatTime } from "@/lib/format";

interface BottomBarProps {
  currentTime: number;
  remaining: number;
  duration: number;
  buffered: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  isPlaying: boolean;
  onSeekRatio: (ratio: number) => void;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
  onPlaybackRateChange: (rate: number) => void;
  onFullscreen: () => void;
  onPictureInPicture: () => void;
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

function BottomBarComponent({
  currentTime,
  remaining,
  duration,
  buffered,
  volume,
  muted,
  playbackRate,
  isPlaying,
  onSeekRatio,
  onTogglePlay,
  onPrevious,
  onNext,
  onToggleMute,
  onVolumeChange,
  onPlaybackRateChange,
  onFullscreen,
  onPictureInPicture,
}: BottomBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = useCallback(
    (clientX: number) => {
      const el = barRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      onSeekRatio(ratio);
    },
    [onSeekRatio]
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black via-black/80 to-transparent px-4 pb-4 pt-16 sm:px-6">
      <div className="pointer-events-auto animate-slide-up space-y-3">
        <div
          ref={barRef}
          className="group relative h-1.5 cursor-pointer rounded-full bg-white/20"
          onClick={(e) => handleSeek(e.clientX)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") onSeekRatio(Math.max((currentTime - 5) / (duration || 1), 0));
            if (e.key === "ArrowRight") onSeekRatio(Math.min((currentTime + 5) / (duration || 1), 1));
          }}
          role="slider"
          tabIndex={0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Seek"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/30 transition-[width] duration-150"
            style={{ width: `${buffered}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-netflix-red transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover:opacity-100"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-white/70 sm:text-sm">
          <div className="flex items-center gap-3">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/30">/</span>
            <span>−{formatTime(remaining)}</span>
            <span className="hidden rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/60 sm:inline">
              Buffered {Math.round(buffered)}%
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <IconButton label="Previous" onClick={onPrevious}>
              <PrevIcon />
            </IconButton>
            <IconButton label={isPlaying ? "Pause" : "Play"} onClick={onTogglePlay} large>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
            <IconButton label="Next" onClick={onNext}>
              <NextIcon />
            </IconButton>

            <div className="ml-1 flex items-center gap-2">
              <IconButton label={muted ? "Unmute" : "Mute"} onClick={onToggleMute}>
                {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
              </IconButton>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="hidden h-1 w-20 cursor-pointer accent-netflix-red sm:block"
                aria-label="Volume"
              />
            </div>

            <label className="ml-1 hidden items-center gap-1 text-white/60 sm:flex">
              <span className="sr-only">Playback speed</span>
              <select
                value={playbackRate}
                onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
                className="rounded border border-white/15 bg-black/50 px-2 py-1 text-xs text-white outline-none hover:border-white/30"
              >
                {RATES.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}x
                  </option>
                ))}
              </select>
            </label>

            <IconButton label="Picture in Picture" onClick={onPictureInPicture}>
              <PipIcon />
            </IconButton>

            <IconButton label="Fullscreen" onClick={onFullscreen}>
              <FullscreenIcon />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({
  children,
  onClick,
  label,
  large = false,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  large?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-white ${
        large ? "h-10 w-10 bg-white/10" : "h-8 w-8"
      }`}
    >
      {children}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  );
}

function PrevIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
    </svg>
  );
}

function VolumeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v2.18l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v4h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

function PipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );
}

export const BottomBar = memo(BottomBarComponent);
