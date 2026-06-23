import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/LoginForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-2xl font-semibold tracking-tight">Sign in to your workspace</h1>
            <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
              Access your company files and records.
            </p>
            <div className="mt-8">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(200,147,43,0.6) 32px), repeating-linear-gradient(90deg, transparent, transparent 31px, rgba(200,147,43,0.6) 32px)",
          }}
        />
        <div className="relative z-10 font-mono text-xs uppercase tracking-widest text-gold-400/80">
          Ledger No. 2026 / 0623
        </div>
        <div className="relative z-10 max-w-md">
          <p className="font-display text-2xl leading-snug text-white">
            One workspace for every company record, document, and filing —
            <span className="text-gold-400"> kept in order.</span>
          </p>
          <p className="mt-4 text-sm text-ink-300">
            NevInfotech Portal gives each company a private, audited storage path
            and a single place to upload and retrieve its files.
          </p>
        </div>
        <div className="relative z-10 text-xs text-ink-400">© 2026 NevInfotech. All rights reserved.</div>
      </div>
    </div>
  );
}
