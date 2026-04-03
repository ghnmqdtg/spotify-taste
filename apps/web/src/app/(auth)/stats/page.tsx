"use client";

import { useLikedTracks } from "@/hooks/use-sync";
import { LibrarySummary } from "@/components/stats/library-summary";
import { TopArtistsChart } from "@/components/stats/top-artists-chart";
import { TimelineChart } from "@/components/stats/timeline-chart";
import { DecadeChart } from "@/components/stats/decade-chart";
import { TasteProfileSection } from "@/components/stats/taste-profile-section";
import { InsightsSection } from "@/components/stats/insights-section";
import { ErrorBoundary } from "@/components/error-boundary";

export default function StatsPage() {
  const { tracks } = useLikedTracks();

  if (tracks.length === 0) {
    return (
      <main className="px-8 py-6">
        <h1 className="mb-4 font-[family-name:var(--font-heading)] text-[28px] font-bold text-foreground">
          Library Stats
        </h1>
        <p className="text-muted">
          No songs synced yet. Visit the dashboard to sync your library.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-heading)] text-[28px] font-bold text-foreground">
          Library Stats
        </h1>
        <span className="font-[family-name:var(--font-accent)] text-sm italic text-muted">
          Updated just now
        </span>
      </div>
      <LibrarySummary tracks={tracks} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopArtistsChart tracks={tracks} />
        <TimelineChart tracks={tracks} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <DecadeChart tracks={tracks} />
        <ErrorBoundary>
          <TasteProfileSection tracks={tracks} />
        </ErrorBoundary>
      </div>
      <ErrorBoundary>
        <InsightsSection tracks={tracks} />
      </ErrorBoundary>
    </main>
  );
}
