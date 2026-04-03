"use client";

import { useMemo } from "react";
import type { LikedTrack } from "@spotify-taste/spotify-client";

export function DecadeChart({ tracks }: { tracks: LikedTrack[] }) {
  const decadeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const track of tracks) {
      const year = parseInt(track.releaseDate.slice(0, 4), 10);
      if (isNaN(year)) continue;
      const decade = `${Math.floor(year / 10) * 10}s`;
      counts.set(decade, (counts.get(decade) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const maxCount = Math.max(...decadeData.map(([, c]) => c), 1);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <h2 className="mb-4 font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
        Release Decades
      </h2>
      <div className="flex flex-col gap-2">
        {decadeData.map(([decade, count]) => (
          <div key={decade} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-sm font-medium text-accent">{decade}</span>
            <div className="flex-1">
              <div className="h-2 rounded bg-background">
                <div
                  className="h-2 rounded bg-accent"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
            <span className="w-10 shrink-0 text-right text-sm text-muted">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
