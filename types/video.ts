export interface VideoItem {
  title: string;
  filename: string;
  url: string;
  size: number;
  modified: string;
}

export interface PlayerState {
  currentFilename: string | null;
  currentTime: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  shuffle: boolean;
  repeat: boolean;
}

export interface PlaybackStats {
  currentTime: number;
  duration: number;
  buffered: number;
  remaining: number;
}

export const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mkv",
  ".webm",
  ".mov",
  ".m4v",
  ".avi",
] as const;

export type VideoExtension = (typeof VIDEO_EXTENSIONS)[number];

export const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".avi": "video/x-msvideo",
};

export const STORAGE_KEY = "cgp-delhi-player-state";

export const DEFAULT_PLAYER_STATE: PlayerState = {
  currentFilename: null,
  currentTime: 0,
  volume: 1,
  muted: true,
  playbackRate: 1,
  shuffle: false,
  repeat: true,
};
