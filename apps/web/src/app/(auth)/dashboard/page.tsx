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
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-[family-name:var(--font-heading)] text-[28px] font-bold text-foreground">
            Your Library
          </h1>
          <span className="font-[family-name:var(--font-accent)] text-sm italic text-muted">
            {allTracks.length.toLocaleString()} songs
          </span>
        </div>
      </div>

      {/* Sync status */}
      {progress && !progress.done && (
        <div className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted">
          Syncing: {progress.fetched.toLocaleString()}
          {progress.total
            ? ` / ~${progress.total.toLocaleString()} songs`
            : " songs"}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-destructive bg-card px-4 py-2 text-sm text-destructive">
          Sync error: {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <SearchBar />
        <div className="ml-auto flex items-center gap-2">
          <Filters allTracks={allTracks} />
          <ExportButton tracks={filteredTracks} />
          <button
            onClick={() =>
              selectAll(filteredTracks.map((t) => t.uri))
            }
            className="rounded-md border border-border px-3 py-1.5 text-[13px] text-muted-foreground hover:text-foreground"
          >
            Select All
          </button>
          {selectedUris.size > 0 && (
            <button
              onClick={deselectAll}
              className="text-[13px] text-muted hover:text-foreground"
            >
              Deselect All
            </button>
          )}
        </div>
      </div>

      <BulkActions />

      {/* Song list in card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <SongList tracks={filteredTracks} />
      </div>
    </main>
  );
}
