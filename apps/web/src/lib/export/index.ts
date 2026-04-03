import type { LikedTrack } from "@spotify-liked-songs-manager/spotify-client";

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(tracks: LikedTrack[]) {
  const header = "Track Name,Artist(s),Album,Date Added,Duration,Spotify URI";
  const rows = tracks.map(
    (t) =>
      `"${t.name.replace(/"/g, '""')}","${t.artistNames.join(", ").replace(/"/g, '""')}","${t.albumName.replace(/"/g, '""')}","${t.addedAt}","${formatDuration(t.durationMs)}","${t.uri}"`
  );
  downloadFile(
    [header, ...rows].join("\n"),
    "liked-songs.csv",
    "text/csv;charset=utf-8"
  );
}

export function exportJSON(tracks: LikedTrack[]) {
  downloadFile(
    JSON.stringify(tracks, null, 2),
    "liked-songs.json",
    "application/json"
  );
}

export function exportM3U(tracks: LikedTrack[]) {
  const lines = ["#EXTM3U"];
  for (const t of tracks) {
    const durationSec = Math.round(t.durationMs / 1000);
    lines.push(
      `#EXTINF:${durationSec},${t.artistNames.join(", ")} - ${t.name}`
    );
    lines.push(t.uri);
  }
  downloadFile(lines.join("\n"), "liked-songs.m3u", "audio/x-mpegurl");
}

export function exportSpotifyURIs(tracks: LikedTrack[]) {
  downloadFile(
    tracks.map((t) => t.uri).join("\n"),
    "liked-songs-uris.txt",
    "text/plain"
  );
}

export type ExportFormat = "csv" | "json" | "m3u" | "uris";

export function exportTracks(tracks: LikedTrack[], format: ExportFormat) {
  switch (format) {
    case "csv":
      return exportCSV(tracks);
    case "json":
      return exportJSON(tracks);
    case "m3u":
      return exportM3U(tracks);
    case "uris":
      return exportSpotifyURIs(tracks);
  }
}
