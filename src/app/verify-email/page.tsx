import { Logo } from "@/components/Logo";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-8" />
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-300 bg-gold-50 text-xl text-gold-600 dark:border-gold-700 dark:bg-gold-900/30 dark:text-gold-400">
        ✉
      </div>
      <h1 className="mt-5 font-display text-xl font-semibold">Verify your email to continue</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-500 dark:text-ink-400">
        We've sent a verification link to your inbox. Once confirmed, sign in again to
        reach your dashboard.
      </p>
      <a
        href="/login"
        className="mt-6 rounded-md bg-ink-900 dark:bg-gold-500 px-5 py-2.5 text-sm font-semibold text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-gold-400 transition-colors"
      >
        Back to sign in
      </a>
    </div>
  );
}
