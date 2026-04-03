"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";

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
    <div className="grid grid-cols-2 gap-4 lg:col-span-2">
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
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft-lift)]">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="font-heading text-3xl font-bold">{value}</p>
    </div>
  );
}
