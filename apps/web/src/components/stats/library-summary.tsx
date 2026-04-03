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
    <div className="grid grid-cols-4 gap-4">
      <StatCard label="Total Songs" value={stats.totalSongs.toLocaleString()} />
      <StatCard
        label="Artists"
        value={stats.uniqueArtists.toLocaleString()}
      />
      <StatCard
        label="Albums"
        value={stats.uniqueAlbums.toLocaleString()}
      />
      <StatCard
        label="Listening Time"
        value={formatTotalDuration(stats.totalDuration)}
      />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-heading)] text-[32px] font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
