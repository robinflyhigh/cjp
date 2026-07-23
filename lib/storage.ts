import type { PlayerState } from "@/types/video";
import { DEFAULT_PLAYER_STATE, STORAGE_KEY } from "@/types/video";

export function loadPlayerState(): PlayerState {
  if (typeof window === "undefined") return { ...DEFAULT_PLAYER_STATE };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PLAYER_STATE };

    const parsed = JSON.parse(raw) as Partial<PlayerState>;
    return {
      ...DEFAULT_PLAYER_STATE,
      ...parsed,
      volume:
        typeof parsed.volume === "number"
          ? Math.min(1, Math.max(0, parsed.volume))
          : DEFAULT_PLAYER_STATE.volume,
      playbackRate:
        typeof parsed.playbackRate === "number"
          ? parsed.playbackRate
          : DEFAULT_PLAYER_STATE.playbackRate,
      currentTime:
        typeof parsed.currentTime === "number" && parsed.currentTime >= 0
          ? parsed.currentTime
          : 0,
    };
  } catch {
    return { ...DEFAULT_PLAYER_STATE };
  }
}

export function savePlayerState(state: PlayerState): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota / private mode errors
  }
}
