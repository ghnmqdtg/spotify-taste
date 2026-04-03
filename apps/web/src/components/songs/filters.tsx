"use client";

import { useMemo, useState } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";
import { useLibraryStore } from "@/stores/library-store";

interface FiltersProps {
  allTracks: LikedTrack[];
}

export function Filters({ allTracks }: FiltersProps) {
  const { filters, setFilters, clearFilters } = useLibraryStore();
  const [showFilters, setShowFilters] = useState(false);

  const allArtists = useMemo(() => {
    const counts = new Map<string, number>();
    for (const track of allTracks) {
      for (const artist of track.artistNames) {
        counts.set(artist, (counts.get(artist) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [allTracks]);

  const allAlbums = useMemo(() => {
    const counts = new Map<string, number>();
    for (const track of allTracks) {
      counts.set(track.albumName, (counts.get(track.albumName) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [allTracks]);

  const hasActiveFilters =
    filters.artists.length > 0 ||
    filters.albums.length > 0 ||
    filters.dateRange.from !== null ||
    filters.dateRange.to !== null ||
    filters.durationRange.min !== null ||
    filters.durationRange.max !== null ||
    filters.explicit !== null;

  return (
    <div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-md border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
        >
          Filters {hasActiveFilters && "*"}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-muted hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {showFilters && (
        <div className="mt-3 grid grid-cols-1 gap-4 rounded-md border border-border p-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Artist filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Artists
            </label>
            <select
              multiple
              value={filters.artists}
              onChange={(e) =>
                setFilters({
                  artists: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value
                  ),
                })
              }
              className="h-32 w-full rounded border border-border bg-card text-sm"
            >
              {allArtists.slice(0, 100).map((artist) => (
                <option key={artist} value={artist}>
                  {artist}
                </option>
              ))}
            </select>
          </div>

          {/* Album filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Albums
            </label>
            <select
              multiple
              value={filters.albums}
              onChange={(e) =>
                setFilters({
                  albums: Array.from(
                    e.target.selectedOptions,
                    (o) => o.value
                  ),
                })
              }
              className="h-32 w-full rounded border border-border bg-card text-sm"
            >
              {allAlbums.slice(0, 100).map((album) => (
                <option key={album} value={album}>
                  {album}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Date Added
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateRange.from ?? ""}
                onChange={(e) =>
                  setFilters({
                    dateRange: {
                      ...filters.dateRange,
                      from: e.target.value || null,
                    },
                  })
                }
                className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={filters.dateRange.to ?? ""}
                onChange={(e) =>
                  setFilters({
                    dateRange: {
                      ...filters.dateRange,
                      to: e.target.value || null,
                    },
                  })
                }
                className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Duration range filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Duration (seconds)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={
                  filters.durationRange.min !== null
                    ? filters.durationRange.min / 1000
                    : ""
                }
                onChange={(e) =>
                  setFilters({
                    durationRange: {
                      ...filters.durationRange,
                      min: e.target.value ? Number(e.target.value) * 1000 : null,
                    },
                  })
                }
                className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={
                  filters.durationRange.max !== null
                    ? filters.durationRange.max / 1000
                    : ""
                }
                onChange={(e) =>
                  setFilters({
                    durationRange: {
                      ...filters.durationRange,
                      max: e.target.value ? Number(e.target.value) * 1000 : null,
                    },
                  })
                }
                className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
              />
            </div>
          </div>

          {/* Explicit filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Explicit
            </label>
            <select
              value={
                filters.explicit === null
                  ? ""
                  : filters.explicit
                    ? "true"
                    : "false"
              }
              onChange={(e) =>
                setFilters({
                  explicit:
                    e.target.value === ""
                      ? null
                      : e.target.value === "true",
                })
              }
              className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="true">Explicit only</option>
              <option value="false">Clean only</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

interface FilterCountProps {
  filteredCount: number;
  totalCount: number;
}

export function FilterCount({ filteredCount, totalCount }: FilterCountProps) {
  if (filteredCount === totalCount) {
    return (
      <span className="text-sm text-muted">
        {totalCount.toLocaleString()} songs
      </span>
    );
  }
  return (
    <span className="text-sm text-muted">
      Showing {filteredCount.toLocaleString()} of{" "}
      {totalCount.toLocaleString()} songs
    </span>
  );
}
