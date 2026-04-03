"use client";

import { useState } from "react";
import type { LikedTrack } from "@spotify-liked-songs-manager/spotify-client";
import { exportTracks, type ExportFormat } from "@/lib/export";

const FORMATS: { value: ExportFormat; label: string; description: string }[] = [
  { value: "csv", label: "CSV", description: "Spreadsheet-compatible format" },
  { value: "json", label: "JSON", description: "Full track data" },
  { value: "m3u", label: "M3U", description: "Playlist file format" },
  { value: "uris", label: "Spotify URIs", description: "One URI per line" },
];

interface ExportDialogProps {
  tracks: LikedTrack[];
}

export function ExportButton({ tracks }: ExportDialogProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");

  function handleExport() {
    exportTracks(tracks, format);
    setShowDialog(false);
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
      >
        Export
      </button>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Export {tracks.length.toLocaleString()} songs
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-muted hover:text-foreground"
              >
                X
              </button>
            </div>

            <div className="mb-4 flex flex-col gap-2">
              {FORMATS.map((f) => (
                <label
                  key={f.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-input p-3 hover:bg-accent"
                >
                  <input
                    type="radio"
                    name="format"
                    value={f.value}
                    checked={format === f.value}
                    onChange={() => setFormat(f.value)}
                  />
                  <div>
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="ml-2 text-xs text-muted">
                      {f.description}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <button
              onClick={handleExport}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </>
  );
}
