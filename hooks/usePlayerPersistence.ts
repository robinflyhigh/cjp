"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerState } from "@/types/video";
import { loadPlayerState, savePlayerState } from "@/lib/storage";

export function usePlayerPersistence() {
  const [state, setState] = useState<PlayerState | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setState(loadPlayerState());
  }, []);

  const persist = useCallback((next: PlayerState) => {
    setState(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      savePlayerState(next);
    }, 250);
  }, []);

  const update = useCallback(
    (partial: Partial<PlayerState>) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...partial };
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
          savePlayerState(next);
        }, 250);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { state, persist, update, ready: state !== null };
}
