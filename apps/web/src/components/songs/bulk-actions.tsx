"use client";

import { useState } from "react";
import {
  batchRemoveFromLibrary,
  batchAddToLibrary,
  batchAddToPlaylist,
  batchRemoveFromPlaylist,
  createPlaylist,
  spotifyFetch,
  type SpotifyPlaylist,
  type SpotifyPaginatedResponse,
  type SpotifyUser,
} from "@spotify-liked-songs-manager/spotify-client";
import { useLibraryStore } from "@/stores/library-store";
import { useUndoStore } from "@/stores/undo-store";
import { db } from "@/lib/db";

export function BulkActions() {
  const { selectedUris, deselectAll } = useLibraryStore();
  const { lastOperation, setOperation, clearOperation } = useUndoStore();
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const count = selectedUris.size;
  if (count === 0 && !lastOperation) return null;

  async function handleUnlike() {
    if (!confirm(`Unlike ${count} songs?`)) return;
    const uris = [...selectedUris];
    setError(null);

    try {
      await batchRemoveFromLibrary(uris);
      await db.likedTracks.bulkDelete(uris);
      deselectAll();
      setOperation({ type: "unlike", trackUris: uris, timestamp: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlike failed");
    }
  }

  async function handleAddToPlaylist(playlistId: string) {
    const uris = [...selectedUris];
    setError(null);

    try {
      await batchAddToPlaylist(playlistId, uris);
      deselectAll();
      setShowPlaylistPicker(false);

      if (moveMode) {
        await batchRemoveFromLibrary(uris);
        await db.likedTracks.bulkDelete(uris);
        setOperation({
          type: "move-to-playlist",
          trackUris: uris,
          playlistId,
          timestamp: Date.now(),
        });
      } else {
        setOperation({
          type: "add-to-playlist",
          trackUris: uris,
          playlistId,
          timestamp: Date.now(),
        });
      }
      setMoveMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Add to playlist failed");
    }
  }

  async function handleUndo() {
    if (!lastOperation) return;
    setError(null);

    try {
      switch (lastOperation.type) {
        case "unlike":
          await batchAddToLibrary(lastOperation.trackUris);
          break;
        case "move-to-playlist":
          await batchAddToLibrary(lastOperation.trackUris);
          if (lastOperation.playlistId) {
            await batchRemoveFromPlaylist(
              lastOperation.playlistId,
              lastOperation.trackUris
            );
          }
          break;
        case "add-to-playlist":
          if (lastOperation.playlistId) {
            await batchRemoveFromPlaylist(
              lastOperation.playlistId,
              lastOperation.trackUris
            );
          }
          break;
      }
      clearOperation();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Undo failed");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-3">
      {count > 0 && (
        <>
          <span className="text-sm font-medium">
            {count} selected
          </span>
          <button
            onClick={handleUnlike}
            className="rounded-md bg-destructive px-3 py-1.5 text-sm text-destructive-foreground hover:opacity-90"
          >
            Unlike
          </button>
          <button
            onClick={() => {
              setMoveMode(false);
              setShowPlaylistPicker(true);
            }}
            className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
          >
            Add to Playlist
          </button>
          <button
            onClick={() => {
              setMoveMode(true);
              setShowPlaylistPicker(true);
            }}
            className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
          >
            Move to Playlist
          </button>
        </>
      )}

      {lastOperation && (
        <button
          onClick={handleUndo}
          className="rounded-md border border-primary px-3 py-1.5 text-sm text-primary hover:bg-primary/10"
        >
          Undo
        </button>
      )}

      {error && (
        <span className="text-sm text-destructive">{error}</span>
      )}

      {showPlaylistPicker && (
        <PlaylistPicker
          onSelect={handleAddToPlaylist}
          onClose={() => {
            setShowPlaylistPicker(false);
            setMoveMode(false);
          }}
        />
      )}
    </div>
  );
}

function PlaylistPicker({
  onSelect,
  onClose,
}: {
  onSelect: (playlistId: string) => void;
  onClose: () => void;
}) {
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useState(() => {
    spotifyFetch<SpotifyPaginatedResponse<SpotifyPlaylist>>(
      "/me/playlists?limit=50"
    )
      .then((res) => setPlaylists(res.items))
      .finally(() => setLoading(false));
  });

  async function handleCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const user = await spotifyFetch<SpotifyUser>("/me");
    const playlist = await createPlaylist(user.id, newName.trim());
    onSelect(playlist.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Playlist</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground">
            X
          </button>
        </div>

        {/* Create new */}
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New playlist name..."
            className="flex-1 rounded border border-input bg-secondary px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleCreate}
            disabled={creating || !newName.trim()}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-50"
          >
            Create
          </button>
        </div>

        {/* Existing playlists */}
        <div className="max-h-60 overflow-auto">
          {loading ? (
            <p className="text-sm text-muted">Loading playlists...</p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => onSelect(pl.id)}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span className="truncate">{pl.name}</span>
                <span className="text-xs text-muted">
                  {pl.tracks.total} tracks
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
