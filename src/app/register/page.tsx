import { Logo } from "@/components/Logo";
import { RegisterForm } from "@/components/RegisterForm";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col px-6 py-8 sm:px-10">
      <div className="flex items-center justify-between">
        <Logo />
        <ThemeToggle />
      </div>
      <div className="flex flex-1 items-center justify-center py-10">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
            We'll send a verification link to confirm your email.
          </p>
          <div className="mt-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
