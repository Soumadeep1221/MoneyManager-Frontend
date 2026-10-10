"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import {
  Eye, EyeOff, TrendingUp, ArrowUpRight, ArrowDownRight,
  Wallet, ShieldCheck, Sparkles, Mail, LockKeyhole, Check,
} from "lucide-react";
import { auth, isApiError, type AuthDTO } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Auth visual panel ────────────────────────────────────────────────────────

function AuthVisual() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-[linear-gradient(135deg,#075e68_0%,#0d7377_42%,#14b8a6_76%,#b8f5e5_140%)] px-7 py-6 sm:px-9 sm:py-7 xl:px-12">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="pointer-events-none absolute -left-28 top-24 h-[430px] w-[430px] rounded-full bg-[#9cf5e1]/20 blur-[110px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-[#d8fff5]/20 blur-[100px]" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/15 shadow-[0_8px_24px_rgba(2,50,56,0.18)] backdrop-blur-sm">
          <Wallet size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Money Manager
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center py-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
          Financial clarity, beautifully organized
        </p>
        <h1 className="max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl xl:text-5xl">
          Your money. Your clarity. Your future.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
          Track income and expenses, spot spending patterns, and watch your financial growth compound with every clear decision.
        </p>

        <div className="mt-7 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="animate-fade-in col-span-2 rounded-2xl border border-white/25 bg-white/15 p-4 shadow-[0_14px_40px_rgba(1,49,57,0.12)] backdrop-blur-md sm:col-span-2">
            <div>
              <p className="mb-1 text-xs text-white/65">Total balance</p>
              <p className="text-2xl font-semibold tracking-tight text-white tabular-nums">₹1,24,500</p>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="flex items-center gap-1 text-xs font-medium text-[#b8ffe8]"><TrendingUp size={13} /> +12.8% this month</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><TrendingUp size={16} className="text-white/90" /></div>
            </div>
          </div>
          <div className="animate-fade-in rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md" style={{ animationDelay: "100ms" }}>
            <div className="mb-3 flex items-center gap-1.5">
                <ArrowUpRight size={13} className="text-success" />
                <span className="text-xs text-white/65">Income</span>
            </div>
            <p className="font-semibold text-white tabular-nums">₹45,000</p>
            <p className="mt-1 text-[11px] text-white/55">+8.4% vs last month</p>
          </div>
          <div className="animate-fade-in rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md" style={{ animationDelay: "180ms" }}>
            <div className="mb-3 flex items-center gap-1.5">
                <ArrowDownRight size={13} className="text-danger" />
                <span className="text-xs text-white/65">Expenses</span>
            </div>
            <p className="font-semibold text-white tabular-nums">₹18,200</p>
            <p className="mt-1 text-[11px] text-white/55">-3.1% vs last month</p>
          </div>
        </div>

        <div className="mt-3 grid max-w-2xl gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="animate-fade-in rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md" style={{ animationDelay: "220ms" }}>
            <div className="mb-3 flex items-center justify-between">
              <div><p className="text-xs font-medium text-white/85">Income vs expenses</p><p className="text-[11px] text-white/55">Last 6 months</p></div>
              <Sparkles size={15} className="text-[#b8ffe8]" />
            </div>
            <svg viewBox="0 0 340 90" className="h-20 w-full overflow-visible" role="img" aria-label="Income and expenses trend chart">
              <path d="M0 69 C28 62 38 48 65 54 S103 39 130 44 S164 28 194 34 S226 20 256 27 S296 17 340 8" fill="none" stroke="#b8ffe8" strokeWidth="3" strokeLinecap="round" />
              <path d="M0 78 C28 72 43 65 65 69 S105 58 130 63 S166 48 194 56 S226 42 256 48 S300 38 340 31" fill="none" stroke="#ff8a8a" strokeOpacity=".9" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0 69 C28 62 38 48 65 54 S103 39 130 44 S164 28 194 34 S226 20 256 27 S296 17 340 8 V90 H0Z" fill="#b8ffe8" fillOpacity=".08" />
            </svg>
            <div className="mt-1 flex gap-4 text-[10px] text-white/60"><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#b8ffe8]" />Income</span><span className="flex items-center gap-1"><i className="h-1.5 w-1.5 rounded-full bg-[#ff8a8a]" />Expenses</span></div>
          </div>
          <MiniDonut title="Income mix" value="₹45k" segments="income" />
          <MiniDonut title="Expense mix" value="₹18k" segments="expense" />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-white/65">
          <ShieldCheck size={14} className="text-[#b8ffe8]" />
          <span>Your data stays private. Always.</span>
          <span className="ml-auto hidden items-center gap-1.5 text-white/55 sm:flex"><Check size={13} /> Built for better habits</span>
        </div>
      </div>
    </div>
  );
}

function MiniDonut({ title, value, segments }: { title: string; value: string; segments: "income" | "expense" }) {
  const colors = segments === "income" ? ["#b8ffe8", "#52d6c0", "#0d7377"] : ["#ff9e9e", "#ff7777", "#0d7377"];
  return (
    <div className="animate-fade-in rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md">
      <p className="text-xs font-medium text-white/85">{title}</p>
      <div className="relative mx-auto mt-2 h-[76px] w-[76px]">
        <div className="h-full w-full rounded-full" style={{ background: `conic-gradient(${colors[0]} 0 44%, ${colors[1]} 44% 72%, ${colors[2]} 72% 100%)` }} />
        <div className="absolute inset-[9px] flex items-center justify-center rounded-full bg-[#167d82]/90 text-[11px] font-semibold text-white">{value}</div>
      </div>
      <div className="mt-2 flex justify-center gap-2 text-[9px] text-white/55"><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[0] }} /> Essentials</div>
    </div>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const { error: toastError } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<{ email?: string; password?: string }>({});

  // If already logged in, go to dashboard
  React.useEffect(() => {
    if (auth.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function validate(email: string, password: string) {
    const errs: { email?: string; password?: string } = {};
    if (!email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;

    const errs = validate(email, password);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const credentials: AuthDTO = { email, password };
      await login(credentials);
      router.replace("/dashboard");
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 401) {
          setError("Invalid email or password. Please try again.");
        } else if (err.status === 0) {
          setError("Cannot connect to server. Make sure the backend is running.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse: CredentialResponse) {
    if (!credentialResponse.credential) {
      toastError("Google sign-in failed. Please try again.");
      return;
    }

    try {
      await loginWithGoogle(credentialResponse.credential);
      router.replace("/dashboard");
    } catch (err) {
      toastError(isApiError(err) ? err.message : "Google sign-in failed. Please try again.");
    }
  }

  return (
    <div className="h-[100svh] min-h-[560px] overflow-hidden bg-[#e8fbf6] lg:grid lg:grid-cols-[1.22fr_1fr]">
      <div className="hidden lg:block lg:h-screen"><AuthVisual /></div>

      <main className="flex h-[100svh] min-h-[560px] items-center justify-center px-4 py-3 sm:px-8 sm:py-4 lg:px-10 xl:px-16">
        <section className="my-3 max-h-[calc(100svh-1.5rem)] w-full max-w-[500px] overflow-y-auto rounded-[1.5rem] border border-white/80 bg-white/65 p-4 shadow-[0_25px_80px_rgba(8,95,98,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-6">
          <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 lg:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm"><Wallet size={16} className="text-white" /></div><span className="font-bold tracking-tight text-foreground">Money Manager</span></div>
            <div className="flex w-full rounded-xl border border-primary/10 bg-primary/5 p-1 text-xs font-semibold text-foreground-muted sm:ml-auto sm:w-auto">
              <span className="flex-1 rounded-lg bg-primary px-3 py-2 text-center text-white shadow-sm">Sign in</span>
              <Link href="/signup" className="flex-1 rounded-lg px-3 py-2 text-center whitespace-nowrap transition-colors hover:bg-white/70">Create account</Link>
            </div>
          </div>

          <div className="mb-5"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Your financial workspace</p><h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Welcome back</h2><p className="mt-1 text-sm text-foreground-muted">Sign in to continue to your account.</p></div>

          <form onSubmit={handleSubmit} noValidate className="space-y-3">
            <Input label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={fieldErrors.email} leftIcon={<Mail size={16} />} className="h-10 rounded-xl border-primary/10 bg-white/70 pl-10 shadow-[0_4px_16px_rgba(13,115,119,0.04)]" required />
            <Input label="Password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Your password" error={fieldErrors.password} leftIcon={<LockKeyhole size={16} />} rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightIconClick={() => setShowPassword((v) => !v)} className="h-10 rounded-xl border-primary/10 bg-white/70 pl-10 shadow-[0_4px_16px_rgba(13,115,119,0.04)]" required />

            {error && <div className="rounded-xl border border-danger/20 bg-danger-light/70 px-3 py-2.5 text-sm text-danger">{error}</div>}

            <div className="flex items-center justify-between gap-4 pt-1"><label className="flex cursor-pointer select-none items-center gap-2 text-sm text-foreground-muted"><input type="checkbox" name="remember" className="h-4 w-4 cursor-pointer rounded border-border accent-primary" />Remember me</label><button type="button" className="text-sm font-medium text-primary transition-colors hover:text-primary-hover">Forgot password?</button></div>

            <Button type="submit" size="xl" loading={loading} className="mt-1 h-10 w-full rounded-xl font-semibold shadow-[0_10px_25px_rgba(13,115,119,0.22)]">Sign in <ArrowUpRight size={17} /></Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-foreground-muted/70"><span className="h-px flex-1 bg-primary/10" />Or continue with<span className="h-px flex-1 bg-primary/10" /></div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toastError("Google sign-in failed. Please try again.")}
              width="320"
            />
          </div>

          <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-foreground-muted/70"><span className="h-px flex-1 bg-primary/10" />Secure access<span className="h-px flex-1 bg-primary/10" /></div>
          <div className="flex items-center justify-center gap-2 text-xs text-foreground-muted"><ShieldCheck size={14} className="text-primary" /> Private by design, clear by default</div>
          <p className="mt-4 text-center text-sm text-foreground-muted">Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Create one</Link></p>
        </section>
      </main>
    </div>
  );
}
