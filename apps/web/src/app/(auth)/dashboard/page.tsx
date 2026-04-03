"use client";

import { useLikedTracks, useAutoSync } from "@/hooks/use-sync";
import { useFilteredTracks } from "@/hooks/use-filtered-tracks";
import { SongList } from "@/components/songs/song-list";
import { SearchBar } from "@/components/songs/search-bar";
import { Filters, FilterCount } from "@/components/songs/filters";
import { BulkActions } from "@/components/songs/bulk-actions";
import { ExportButton } from "@/components/songs/export-dialog";
import { useLibraryStore } from "@/stores/library-store";

export default function DashboardPage() {
  const { progress, error } = useAutoSync();
  const { tracks: allTracks } = useLikedTracks();
  const filteredTracks = useFilteredTracks(allTracks);
  const { selectedUris, selectAll, deselectAll } = useLibraryStore();

  return (
    <main className="flex flex-col gap-5 px-8 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Your Library</h1>
        <span className="font-caption text-sm italic text-muted">
          {allTracks.length.toLocaleString()} songs
        </span>
      </div>

      {/* Sync status */}
      {progress && !progress.done && (
        <div className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-muted shadow-[var(--shadow-soft-lift)]">
          Syncing: {progress.fetched.toLocaleString()}
          {progress.total
            ? ` / ~${progress.total.toLocaleString()} songs`
            : " songs"}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive bg-card px-4 py-2 text-sm text-destructive">
          Sync error: {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar />
        <FilterCount
          filteredCount={filteredTracks.length}
          totalCount={allTracks.length}
        />
        <div className="ml-auto flex items-center gap-2">
          <ExportButton tracks={filteredTracks} />
          <button
            onClick={() =>
              selectAll(filteredTracks.map((t) => t.uri))
            }
            className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
          >
            Select All
          </button>
          {selectedUris.size > 0 && (
            <button
              onClick={deselectAll}
              className="text-sm text-muted hover:text-foreground"
            >
              Deselect All
            </button>
          )}
        </div>
      </div>

      <Filters allTracks={allTracks} />
      <BulkActions />

      {/* Song list */}
      <SongList tracks={filteredTracks} />
    </main>
  );
}
