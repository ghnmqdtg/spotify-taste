"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";

export function TopArtistsChart({ tracks }: { tracks: LikedTrack[] }) {
  const topArtists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const track of tracks) {
      for (const artist of track.artistNames) {
        counts.set(artist, (counts.get(artist) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [tracks]);

  const maxCount = topArtists[0]?.[1] ?? 1;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
        Top Artists
      </h2>
      <div className="flex flex-col gap-3">
        {topArtists.slice(0, 5).map(([artist, count], index) => (
          <div key={artist} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-sm font-semibold text-accent">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-foreground">
                {artist}
              </span>
              <span className="font-[family-name:var(--font-accent)] text-xs text-muted">
                {count} songs
              </span>
            </div>
            <div className="w-[120px] shrink-0">
              <div className="h-2 rounded bg-background">
                <div
                  className="h-2 rounded bg-accent"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
