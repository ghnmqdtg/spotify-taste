"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";

export function TimelineChart({ tracks }: { tracks: LikedTrack[] }) {
  const monthlyData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const track of tracks) {
      const date = new Date(track.addedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const maxCount = Math.max(...monthlyData.map(([, c]) => c), 1);

  // Show last 24 months max for readability
  const displayData = monthlyData.slice(-24);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft-lift)]">
      <h2 className="mb-4 font-heading text-lg font-semibold">Songs Over Time</h2>
      <div className="flex items-end gap-1" style={{ height: "200px" }}>
        {displayData.map(([month, count]) => (
          <div key={month} className="group relative flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-primary transition-opacity hover:opacity-80"
              style={{ height: `${(count / maxCount) * 180}px` }}
            />
            <span className="absolute -top-6 hidden text-xs text-muted group-hover:block">
              {count}
            </span>
          </div>
        ))}
      </div>
      {displayData.length > 0 && (
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{formatMonth(displayData[0][0])}</span>
          <span>{formatMonth(displayData[displayData.length - 1][0])}</span>
        </div>
      )}
    </div>
  );
}

function formatMonth(yyyymm: string): string {
  const [year, month] = yyyymm.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
  });
}
