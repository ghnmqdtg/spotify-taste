"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";
import { autoSync, type SyncProgress } from "@/lib/sync";
import type { LikedTrack } from "@spotify-taste/spotify-client";

const INITIAL_BATCH = 100;
const CHUNK_SIZE = 500;

export function useSync() {
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const syncingRef = useRef(false);

  const startSync = useCallback(async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    setError(null);

    try {
      await autoSync(setProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      syncingRef.current = false;
    }
  }, []);

  return { progress, error, startSync, isSyncing: syncingRef.current };
}

export function useLikedTracks(): {
  tracks: LikedTrack[];
  isFullyLoaded: boolean;
} {
  const [tracks, setTracks] = useState<LikedTrack[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    async function loadProgressively() {
      // First batch: show something instantly
      const initial = await db.likedTracks
        .orderBy("addedAt")
        .reverse()
        .limit(INITIAL_BATCH)
        .toArray();
      setTracks(initial);

      // Load rest in chunks
      const total = await db.likedTracks.count();
      if (total <= INITIAL_BATCH) {
        setIsFullyLoaded(true);
        return;
      }

      let offset = INITIAL_BATCH;
      const allTracks = [...initial];

      while (offset < total) {
        const chunk = await db.likedTracks
          .orderBy("addedAt")
          .reverse()
          .offset(offset)
          .limit(CHUNK_SIZE)
          .toArray();
        allTracks.push(...chunk);
        setTracks([...allTracks]);
        offset += CHUNK_SIZE;
      }

      setIsFullyLoaded(true);
    }

    loadProgressively();
  }, []);

  // Re-run when sync adds tracks — poll on a lightweight count check
  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await db.likedTracks.count();
      if (count !== tracks.length) {
        const all = await db.likedTracks
          .orderBy("addedAt")
          .reverse()
          .toArray();
        setTracks(all);
        setIsFullyLoaded(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [tracks.length]);

  return { tracks, isFullyLoaded };
}

export function useAutoSync() {
  const { startSync, progress, error } = useSync();

  useEffect(() => {
    startSync();
  }, [startSync]);

  return { progress, error };
}
