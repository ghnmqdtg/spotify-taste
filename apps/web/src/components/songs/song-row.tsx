"use client";

import type { LikedTrack } from "@spotify-taste/spotify-client";
import { useLibraryStore } from "@/stores/library-store";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface SongRowProps {
  track: LikedTrack;
  style: React.CSSProperties;
}

export function SongRow({ track, style }: SongRowProps) {
  const { toggleSelection, selectedUris } = useLibraryStore();
  const isSelected = selectedUris.has(track.uri);

  return (
    <div
      style={style}
      className={`flex items-center gap-3 border-b border-border px-4 ${
        isSelected ? "bg-accent/50" : "hover:bg-accent/30"
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => toggleSelection(track.uri)}
        className="size-4 shrink-0"
      />
      {track.albumImageUrl ? (
        <img
          src={track.albumImageUrl}
          alt={track.albumName}
          className="size-10 shrink-0 rounded"
          loading="lazy"
        />
      ) : (
        <div className="size-10 shrink-0 rounded bg-accent" />
      )}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{track.name}</p>
          <p className="truncate text-xs text-muted">
            {track.artistNames.join(", ")}
          </p>
        </div>
        <span className="hidden w-40 shrink-0 truncate text-sm text-muted md:block">
          {track.albumName}
        </span>
        <span className="hidden w-28 shrink-0 text-sm text-muted lg:block">
          {formatDate(track.addedAt)}
        </span>
        <span className="w-12 shrink-0 text-right text-sm text-muted">
          {formatDuration(track.durationMs)}
        </span>
      </div>
    </div>
  );
}
