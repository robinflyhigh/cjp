"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { PlaybackStats, PlayerState, VideoItem } from "@/types/video";
import { clamp } from "@/lib/format";
import { useKeyboardControls } from "@/hooks/useKeyboardControls";
import { usePlayerPersistence } from "@/hooks/usePlayerPersistence";

interface UseVideoPlayerOptions {
  videos: VideoItem[];
  containerRef: RefObject<HTMLElement | null>;
}

export function useVideoPlayer({ videos, containerRef }: UseVideoPlayerOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloadRef = useRef<HTMLVideoElement | null>(null);
  const { state, update, ready } = usePlayerPersistence();

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRestored, setHasRestored] = useState(false);
  const [stats, setStats] = useState<PlaybackStats>({
    currentTime: 0,
    duration: 0,
    buffered: 0,
    remaining: 0,
  });

  const currentVideo = videos[index] ?? null;
  const nextIndex = videos.length > 0 ? (index + 1) % videos.length : 0;
  const prevIndex =
    videos.length > 0 ? (index - 1 + videos.length) % videos.length : 0;
  const nextVideo = videos[nextIndex] ?? null;

  const shuffle = state?.shuffle ?? false;
  const repeat = state?.repeat ?? true;

  const pickNextIndex = useCallback(
    (from: number) => {
      if (videos.length === 0) return 0;
      if (shuffle && videos.length > 1) {
        let next = from;
        while (next === from) {
          next = Math.floor(Math.random() * videos.length);
        }
        return next;
      }
      return (from + 1) % videos.length;
    },
    [shuffle, videos.length]
  );

  // Restore saved index once videos + persistence are ready
  useEffect(() => {
    if (!ready || hasRestored || videos.length === 0) return;

    const savedName = state?.currentFilename;
    if (savedName) {
      const found = videos.findIndex((v) => v.filename === savedName);
      if (found >= 0) {
        setIndex(found);
      }
    }
    setHasRestored(true);
  }, [ready, hasRestored, videos, state?.currentFilename]);

  // Apply volume / mute / rate from persistence
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !state) return;
    el.volume = clamp(state.volume, 0, 1);
    el.muted = state.muted;
    el.playbackRate = state.playbackRate;
  }, [state?.volume, state?.muted, state?.playbackRate, currentVideo?.filename]);

  // Restore playback position for current video
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !state || !hasRestored || !currentVideo) return;

    const shouldRestore =
      state.currentFilename === currentVideo.filename && state.currentTime > 1;

    const onLoaded = () => {
      if (shouldRestore && Number.isFinite(el.duration)) {
        el.currentTime = Math.min(state.currentTime, Math.max(el.duration - 1, 0));
      }
      el.play().catch(() => {
        // Autoplay may be blocked until muted interaction — already muted by default
      });
    };

    if (el.readyState >= 1) {
      onLoaded();
    } else {
      el.addEventListener("loadedmetadata", onLoaded, { once: true });
      return () => el.removeEventListener("loadedmetadata", onLoaded);
    }
  }, [currentVideo?.filename, hasRestored]);

  // Preload next video
  useEffect(() => {
    const preload = preloadRef.current;
    if (!preload || !nextVideo) return;
    if (nextVideo.filename === currentVideo?.filename) {
      preload.removeAttribute("src");
      preload.load();
      return;
    }
    preload.src = nextVideo.url;
    preload.preload = "auto";
    preload.load();
  }, [nextVideo?.url, nextVideo?.filename, currentVideo?.filename]);

  const persistProgress = useCallback(
    (time: number) => {
      if (!currentVideo || !state) return;
      update({
        currentFilename: currentVideo.filename,
        currentTime: time,
      });
    },
    [currentVideo, state, update]
  );

  const goToIndex = useCallback(
    (next: number, resetTime = true) => {
      if (videos.length === 0) return;
      const clamped = ((next % videos.length) + videos.length) % videos.length;
      setIndex(clamped);
      setIsLoading(true);
      const target = videos[clamped];
      update({
        currentFilename: target.filename,
        currentTime: resetTime ? 0 : state?.currentTime ?? 0,
      });
    },
    [videos, update, state?.currentTime]
  );

  const playNext = useCallback(() => {
    if (videos.length === 0) return;
    goToIndex(pickNextIndex(index), true);
  }, [videos.length, index, goToIndex, pickNextIndex]);

  const playPrevious = useCallback(() => {
    goToIndex(prevIndex, true);
  }, [goToIndex, prevIndex]);

  const togglePlay = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => undefined);
    } else {
      el.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!state) return;
    update({ muted: !state.muted });
  }, [state, update]);

  const setVolume = useCallback(
    (volume: number) => {
      update({ volume: clamp(volume, 0, 1), muted: volume === 0 ? true : false });
    },
    [update]
  );

  const volumeUp = useCallback(() => {
    if (!state) return;
    const next = clamp(state.volume + 0.05, 0, 1);
    update({ volume: next, muted: false });
  }, [state, update]);

  const volumeDown = useCallback(() => {
    if (!state) return;
    const next = clamp(state.volume - 0.05, 0, 1);
    update({ volume: next, muted: next === 0 });
  }, [state, update]);

  const setPlaybackRate = useCallback(
    (rate: number) => {
      update({ playbackRate: rate });
    },
    [update]
  );

  const toggleShuffle = useCallback(() => {
    if (!state) return;
    update({ shuffle: !state.shuffle });
  }, [state, update]);

  const toggleRepeat = useCallback(() => {
    if (!state) return;
    update({ repeat: !state.repeat });
  }, [state, update]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  }, [containerRef]);

  const togglePictureInPicture = useCallback(async () => {
    const el = videoRef.current;
    if (!el || !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await el.requestPictureInPicture();
      }
    } catch {
      // Browser may reject PiP without user gesture or codec support
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const el = videoRef.current;
    if (!el || !Number.isFinite(el.duration)) return;
    el.currentTime = clamp(time, 0, el.duration);
  }, []);

  const seekByRatio = useCallback(
    (ratio: number) => {
      const el = videoRef.current;
      if (!el || !Number.isFinite(el.duration)) return;
      seekTo(clamp(ratio, 0, 1) * el.duration);
    },
    [seekTo]
  );

  const onError = useCallback(() => {
    console.warn("Video failed, skipping to next");
    setTimeout(() => playNext(), 400);
  }, [playNext]);

  const onEnded = useCallback(() => {
    playNext();
  }, [playNext]);

  const onTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;

    let bufferedPct = 0;
    if (el.buffered.length > 0 && el.duration > 0) {
      bufferedPct = (el.buffered.end(el.buffered.length - 1) / el.duration) * 100;
    }

    const currentTime = el.currentTime || 0;
    const duration = el.duration || 0;

    setStats({
      currentTime,
      duration,
      buffered: clamp(bufferedPct, 0, 100),
      remaining: Math.max(duration - currentTime, 0),
    });

    if (Math.floor(currentTime) % 2 === 0) {
      persistProgress(currentTime);
    }
  }, [persistProgress]);

  const keyboardHandlers = useMemo(
    () => ({
      onTogglePlay: togglePlay,
      onPrevious: playPrevious,
      onNext: playNext,
      onFullscreen: toggleFullscreen,
      onToggleMute: toggleMute,
      onVolumeUp: volumeUp,
      onVolumeDown: volumeDown,
    }),
    [
      togglePlay,
      playPrevious,
      playNext,
      toggleFullscreen,
      toggleMute,
      volumeUp,
      volumeDown,
    ]
  );

  useKeyboardControls(keyboardHandlers, videos.length > 0);

  // Persist on unload
  useEffect(() => {
    const flush = () => {
      const el = videoRef.current;
      if (!el || !currentVideo || !state) return;
      const snapshot: PlayerState = {
        ...state,
        currentFilename: currentVideo.filename,
        currentTime: el.currentTime || 0,
      };
      try {
        localStorage.setItem(
          "cgp-delhi-player-state",
          JSON.stringify(snapshot)
        );
      } catch {
        // ignore
      }
    };

    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [currentVideo, state]);

  return {
    videoRef,
    preloadRef,
    currentVideo,
    nextVideo,
    index,
    total: videos.length,
    isPlaying,
    isLoading,
    stats,
    state,
    ready,
    setIsPlaying,
    setIsLoading,
    goToIndex,
    playNext,
    playPrevious,
    togglePlay,
    toggleMute,
    setVolume,
    setPlaybackRate,
    toggleShuffle,
    toggleRepeat,
    toggleFullscreen,
    togglePictureInPicture,
    seekTo,
    seekByRatio,
    onError,
    onEnded,
    onTimeUpdate,
  };
}
