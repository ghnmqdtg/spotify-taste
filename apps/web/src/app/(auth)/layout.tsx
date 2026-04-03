"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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

  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Library" },
    { href: "/stats", label: "Stats" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold text-primary">+</span>
            <span className="font-heading text-lg font-semibold">spotify taste</span>
          </div>
          <nav className="flex items-center rounded-md bg-secondary p-1">
            {navItems.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === href
                    ? "bg-card text-foreground shadow-[var(--shadow-soft-lift)]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <UserProfileMenu />
      </header>
      <div>{children}</div>
    </div>
  );
}
