"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useCurrentUser } from "@/hooks/use-current-user";

function getInitial(displayName: string | null): string {
  if (displayName) return displayName.charAt(0).toUpperCase();
  return "?";
}

function getSpotifyProfileUrl(uri: string): string {
  const id = uri.replace("spotify:user:", "");
  return `https://open.spotify.com/user/${id}`;
}

export function UserProfileMenu() {
  const { logout } = useAuth();
  const { data: user, isLoading } = useCurrentUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (isLoading) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
    );
  }

  const avatarUrl = user?.images?.[0]?.url;
  const initial = getInitial(user?.display_name ?? null);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.display_name ?? "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft-lift)]">
          <div className="mb-3 border-b border-border pb-3">
            <p className="text-sm font-medium text-foreground">
              {user?.display_name ?? "Spotify User"}
            </p>
            {user?.email && (
              <p className="text-xs text-muted">{user.email}</p>
            )}
            {user?.product && (
              <p className="mt-1 text-xs capitalize text-muted">
                {user.product}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {user?.uri && (
              <a
                href={getSpotifyProfileUrl(user.uri)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-2 py-1.5 text-left text-sm text-muted hover:bg-border hover:text-foreground"
              >
                Open in Spotify
              </a>
            )}
            <button
              onClick={logout}
              className="rounded-md px-2 py-1.5 text-left text-sm text-muted hover:bg-border hover:text-foreground"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
