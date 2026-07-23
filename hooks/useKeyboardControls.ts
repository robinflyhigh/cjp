"use client";

import { useEffect } from "react";

export interface KeyboardHandlers {
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onFullscreen: () => void;
  onToggleMute: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function useKeyboardControls(handlers: KeyboardHandlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      switch (event.key) {
        case " ":
        case "Spacebar":
          event.preventDefault();
          handlers.onTogglePlay();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlers.onPrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handlers.onNext();
          break;
        case "f":
        case "F":
          event.preventDefault();
          handlers.onFullscreen();
          break;
        case "m":
        case "M":
          event.preventDefault();
          handlers.onToggleMute();
          break;
        case "ArrowUp":
          event.preventDefault();
          handlers.onVolumeUp();
          break;
        case "ArrowDown":
          event.preventDefault();
          handlers.onVolumeDown();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlers, enabled]);
}
