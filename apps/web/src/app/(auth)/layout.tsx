"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { UserProfileMenu } from "@/components/user-profile-menu";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold">Liked Songs Manager</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-muted hover:text-foreground">
              Library
            </Link>
            <Link href="/stats" className="text-muted hover:text-foreground">
              Stats
            </Link>
          </nav>
        </div>
        <UserProfileMenu />
      </header>
      <div>{children}</div>
    </div>
  );
}
