"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/supabase/client";

export function Navbar({ email }: { email?: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 dark:border-ink-800 bg-[rgb(var(--bg))]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          {email && (
            <span className="hidden font-mono text-xs text-ink-500 dark:text-ink-400 sm:inline">
              {email}
            </span>
          )}
          <ThemeToggle />
          {email && (
            <button
              onClick={handleSignOut}
              className="rounded-md border border-ink-200 dark:border-ink-700 px-3 py-1.5 text-sm font-medium text-ink-700 dark:text-ink-200 hover:border-gold-400 hover:text-gold-700 dark:hover:text-gold-400 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
