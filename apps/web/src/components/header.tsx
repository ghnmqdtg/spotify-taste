"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { UserProfileMenu } from "@/components/user-profile-menu";

const NAV_ITEMS = [
  { label: "Library", href: "/dashboard" },
  { label: "Stats", href: "/stats" },
  { label: "Settings", href: "/settings" },
];

export function Header() {
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const avatarUrl = user?.images?.[0]?.url;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-accent">
            +
          </span>
          <span className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
            spotify taste
          </span>
        </div>
        <nav className="flex items-center">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-[13px] transition-colors ${
                  isActive
                    ? "font-medium text-foreground border-b-2 border-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {user?.display_name && (
          <span className="text-sm font-medium text-foreground">
            {user.display_name}
          </span>
        )}
        <UserProfileMenu />
      </div>
    </header>
  );
}
