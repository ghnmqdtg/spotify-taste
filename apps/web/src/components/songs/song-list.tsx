"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { LikedTrack } from "@spotify-liked-songs-manager/spotify-client";
import { useLibraryStore, type SortColumn } from "@/stores/library-store";
import { SongRow } from "./song-row";

const ROW_HEIGHT = 56;
const OVERSCAN = 5;

interface SongListProps {
  tracks: LikedTrack[];
}

const COLUMNS: { key: SortColumn; label: string; className: string }[] = [
  { key: "name", label: "Title", className: "flex-1 min-w-0" },
  {
    key: "albumName",
    label: "Album",
    className: "hidden md:block w-40 shrink-0",
  },
  {
    key: "addedAt",
    label: "Date Added",
    className: "hidden lg:block w-28 shrink-0",
  },
  { key: "durationMs", label: "Duration", className: "w-12 shrink-0 text-right" },
];

export function SongList({ tracks }: SongListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { sortColumn, sortDirection, setSort } = useLibraryStore();

  const virtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  return (
    <div className="flex flex-col">
      {/* Column headers */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2 text-xs font-medium uppercase text-muted">
        <div className="size-4 shrink-0" /> {/* checkbox spacer */}
        <div className="size-10 shrink-0" /> {/* album art spacer */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {COLUMNS.map((col) => (
            <button
              key={col.key}
              onClick={() => setSort(col.key)}
              className={`${col.className} cursor-pointer hover:text-foreground`}
            >
              {col.label}
              {sortColumn === col.key && (
                <span className="ml-1">
                  {sortDirection === "asc" ? "\u2191" : "\u2193"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Virtualized list */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <SongRow
              key={tracks[virtualRow.index].uri}
              track={tracks[virtualRow.index]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
