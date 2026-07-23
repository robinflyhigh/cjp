"use client";

import { memo, useRef } from "react";
import type { VideoItem } from "@/types/video";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import { TopBar } from "@/components/TopBar";
import { BottomBar } from "@/components/BottomBar";
import { Playlist } from "@/components/Playlist";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface VideoPlayerProps {
  videos: VideoItem[];
}

function VideoPlayerComponent({ videos }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const player = useVideoPlayer({ videos, containerRef });

  if (!player.ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-netflix-dark">
        <LoadingSpinner label="Restoring playback…" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-netflix-dark px-6 text-center">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-netflix-red">
          CGP Delhi
        </p>
        <h1 className="mt-4 font-display text-2xl text-white sm:text-3xl">
          No videos found in ./downloads
        </h1>
        <p className="mt-3 max-w-md text-sm text-white/55">
          Drop mp4, mkv, webm, mov, m4v, or avi files into the downloads folder
          and refresh.
        </p>
      </div>
    );
  }

  const volume = player.state?.volume ?? 1;
  const muted = player.state?.muted ?? true;
  const playbackRate = player.state?.playbackRate ?? 1;
  const shuffle = player.state?.shuffle ?? false;
  const repeat = player.state?.repeat ?? true;

  return (
    <div className="flex min-h-screen flex-col bg-netflix-dark lg:h-screen lg:flex-row lg:overflow-hidden">
      <div
        ref={containerRef}
        className="relative flex min-h-[56vh] flex-1 items-center justify-center overflow-hidden bg-black lg:min-h-0"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(229,9,20,0.18), transparent 55%), radial-gradient(ellipse at bottom, rgba(20,20,20,0.9), #000 70%)",
          }}
        />

        {player.isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
            <LoadingSpinner label="Buffering…" />
          </div>
        )}

        <video
          ref={player.videoRef}
          key={player.currentVideo?.filename}
          className="relative z-[1] h-full w-full object-contain"
          src={player.currentVideo?.url}
          autoPlay
          muted={muted}
          controls={false}
          preload="auto"
          playsInline
          disablePictureInPicture={false}
          onPlay={() => player.setIsPlaying(true)}
          onPause={() => player.setIsPlaying(false)}
          onWaiting={() => player.setIsLoading(true)}
          onCanPlay={() => player.setIsLoading(false)}
          onPlaying={() => player.setIsLoading(false)}
          onTimeUpdate={player.onTimeUpdate}
          onEnded={player.onEnded}
          onError={player.onError}
          onClick={player.togglePlay}
          onDoubleClick={player.toggleFullscreen}
        />

        {/* Hidden preload element for seamless next-video switch */}
        <video
          ref={player.preloadRef}
          className="hidden"
          preload="auto"
          muted
          playsInline
          aria-hidden
        />

        <TopBar
          currentTitle={player.currentVideo?.title ?? ""}
          index={player.index}
          total={player.total}
          nextTitle={player.nextVideo?.title ?? null}
          shuffle={shuffle}
          repeat={repeat}
          onToggleShuffle={player.toggleShuffle}
          onToggleRepeat={player.toggleRepeat}
        />

        <BottomBar
          currentTime={player.stats.currentTime}
          remaining={player.stats.remaining}
          duration={player.stats.duration}
          buffered={player.stats.buffered}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          isPlaying={player.isPlaying}
          onSeekRatio={player.seekByRatio}
          onTogglePlay={player.togglePlay}
          onPrevious={player.playPrevious}
          onNext={player.playNext}
          onToggleMute={player.toggleMute}
          onVolumeChange={player.setVolume}
          onPlaybackRateChange={player.setPlaybackRate}
          onFullscreen={player.toggleFullscreen}
          onPictureInPicture={player.togglePictureInPicture}
        />
      </div>

      <div className="h-[44vh] shrink-0 lg:h-full">
        <Playlist
          videos={videos}
          currentIndex={player.index}
          onSelect={(i) => player.goToIndex(i, true)}
        />
      </div>
    </div>
  );
}

export const VideoPlayer = memo(VideoPlayerComponent);
