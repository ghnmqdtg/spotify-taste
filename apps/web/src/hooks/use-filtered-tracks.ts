"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";
import { useLibraryStore } from "@/stores/library-store";

export function useFilteredTracks(tracks: LikedTrack[]): LikedTrack[] {
  const { searchQuery, sortColumn, sortDirection, filters } =
    useLibraryStore();

  return useMemo(() => {
    let result = tracks;

    // Full-text search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.artistNames.some((a) => a.toLowerCase().includes(q)) ||
          t.albumName.toLowerCase().includes(q)
      );
    }

    // Artist filter
    if (filters.artists.length > 0) {
      const artistSet = new Set(filters.artists);
      result = result.filter((t) =>
        t.artistNames.some((a) => artistSet.has(a))
      );
    }

    // Album filter
    if (filters.albums.length > 0) {
      const albumSet = new Set(filters.albums);
      result = result.filter((t) => albumSet.has(t.albumName));
    }

    // Date range filter
    if (filters.dateRange.from) {
      result = result.filter((t) => t.addedAt >= filters.dateRange.from!);
    }
    if (filters.dateRange.to) {
      result = result.filter((t) => t.addedAt <= filters.dateRange.to!);
    }

    // Duration range filter
    if (filters.durationRange.min !== null) {
      result = result.filter(
        (t) => t.durationMs >= filters.durationRange.min!
      );
    }
    if (filters.durationRange.max !== null) {
      result = result.filter(
        (t) => t.durationMs <= filters.durationRange.max!
      );
    }

    // Explicit filter
    if (filters.explicit !== null) {
      result = result.filter((t) => t.explicit === filters.explicit);
    }

    // Sorting
    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "addedAt":
          cmp = a.addedAt.localeCompare(b.addedAt);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "artistNames":
          cmp = (a.artistNames[0] ?? "").localeCompare(
            b.artistNames[0] ?? ""
          );
          break;
        case "albumName":
          cmp = a.albumName.localeCompare(b.albumName);
          break;
        case "releaseDate":
          cmp = a.releaseDate.localeCompare(b.releaseDate);
          break;
        case "durationMs":
          cmp = a.durationMs - b.durationMs;
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [tracks, searchQuery, sortColumn, sortDirection, filters]);
}
