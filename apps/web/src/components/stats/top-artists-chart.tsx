"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-liked-songs-manager/spotify-client";

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
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Top 10 Artists</h2>
      <div className="flex flex-col gap-2">
        {topArtists.map(([artist, count]) => (
          <div key={artist} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm">{artist}</span>
            <div className="flex-1">
              <div
                className="h-5 rounded bg-primary"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm text-muted">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
