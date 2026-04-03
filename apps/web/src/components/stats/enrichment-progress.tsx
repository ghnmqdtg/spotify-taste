"use client";

export interface EnrichmentProgressProps {
  phase: "idle" | "fetching" | "normalizing" | "complete" | "error";
  completed?: number;
  total?: number;
  error?: string;
}

export function EnrichmentProgress({ phase, completed, total, error }: EnrichmentProgressProps) {
  if (phase === "idle") return null;

  const percentage =
    total && total > 0 ? Math.round((completed ?? 0) / total * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {phase === "fetching" && (
        <>
          <p className="mb-2 text-sm font-medium">
            Fetching artist genres: {completed ?? 0}/{total ?? 0} artists
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </>
      )}

      {phase === "normalizing" && (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm font-medium">Normalizing genres...</p>
        </div>
      )}

      {phase === "complete" && (
        <p className="text-sm font-medium text-green-500">Genre enrichment complete!</p>
      )}

      {phase === "error" && (
        <p className="text-sm font-medium text-red-500">{error ?? "Enrichment failed"}</p>
      )}
    </div>
  );
}
