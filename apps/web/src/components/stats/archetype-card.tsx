"use client";

const ARCHETYPE_ICONS: Record<string, string> = {
  Archaeologist: "\u{1F3DB}",
  "Eclectic Explorer": "\u{1F30D}",
  Loyalist: "\u{2764}",
  Curator: "\u{1F3A8}",
  "Mood Surfer": "\u{1F30A}",
  "Scene Kid": "\u{26A1}",
  "Mainstream Navigator": "\u{2B50}",
};

interface ArchetypeCardProps {
  archetype: string;
  narrative: string;
}

export function ArchetypeCard({ archetype, narrative }: ArchetypeCardProps) {
  const icon = ARCHETYPE_ICONS[archetype] ?? "\u{1F3B5}";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <h3 className="text-lg font-bold">{archetype}</h3>
          <p className="text-xs text-muted">Your listening personality</p>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted">{narrative}</p>
    </div>
  );
}
