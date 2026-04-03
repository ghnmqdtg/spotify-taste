"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-liked-songs-manager/spotify-client";

function formatTotalDuration(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export function LibrarySummary({ tracks }: { tracks: LikedTrack[] }) {
  const stats = useMemo(() => {
    const totalDuration = tracks.reduce((sum, t) => sum + t.durationMs, 0);
    const uniqueArtists = new Set(tracks.flatMap((t) => t.artistNames)).size;
    const uniqueAlbums = new Set(tracks.map((t) => t.albumName)).size;

    return {
      totalSongs: tracks.length,
      totalDuration,
      uniqueArtists,
      uniqueAlbums,
    };
  }, [tracks]);

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Overview</h2>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Songs" value={stats.totalSongs.toLocaleString()} />
        <StatCard
          label="Total Duration"
          value={formatTotalDuration(stats.totalDuration)}
        />
        <StatCard
          label="Unique Artists"
          value={stats.uniqueArtists.toLocaleString()}
        />
        <StatCard
          label="Unique Albums"
          value={stats.uniqueAlbums.toLocaleString()}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
