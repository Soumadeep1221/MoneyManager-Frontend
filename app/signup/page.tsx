"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import {
  Eye, EyeOff, Wallet, CheckCircle2, ArrowLeft,
  TrendingUp, Target, BarChart3, Mail, LockKeyhole, ArrowUpRight, ShieldCheck,
} from "lucide-react";
import { authService, auth, isApiError, type ProfileDTO } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadProfileImage } from "@/lib/cloudinary";

// ─── Auth visual panel (mirrored for signup) ──────────────────────────────────

function SignupVisual() {
  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-[linear-gradient(135deg,#075e68_0%,#0d7377_42%,#14b8a6_76%,#b8f5e5_140%)] px-7 py-6 sm:px-9 sm:py-7 xl:px-12">
      {/* Background grid */}
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

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col justify-center py-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/75">
          A clearer way to grow
        </p>
        <h1 className="max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl xl:text-5xl">
          Start building better financial habits today.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
          Join Money Manager to see where your money goes, make confident decisions, and turn small habits into lasting progress.
        </p>

        {/* Feature highlights */}
        <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
          {[
            {
              icon: TrendingUp,
              title: "Track income & expenses",
              desc: "Log every transaction in seconds",
              delay: 0,
            },
            {
              icon: BarChart3,
              title: "Understand your spending",
              desc: "Visual breakdowns by category",
              delay: 80,
            },
            {
              icon: Target,
              title: "Make smarter decisions",
              desc: "Clear insights, zero confusion",
              delay: 160,
            },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <div
              key={title}
              className="animate-fade-in rounded-2xl border border-white/25 bg-white/12 p-4 backdrop-blur-md"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Icon size={16} className="text-white/90" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="mt-1 text-xs text-white/65">{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-white/65"><ShieldCheck size={14} className="text-[#b8ffe8]" /> Your data stays private. Always.</div>
      </div>
    </div>
  );
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessState({ email }: { email: string }) {
  return (
    <div className="mx-auto w-full max-w-sm flex flex-col items-center text-center animate-fade-in">
      <div className="h-16 w-16 rounded-full bg-success-light border-2 border-success/30 flex items-center justify-center mb-5">
        <CheckCircle2 size={32} className="text-success" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Account created!</h2>
      <p className="text-sm text-foreground-muted mb-2">
        We&apos;ve sent a confirmation email to{" "}
        <strong className="text-foreground">{email}</strong>.
      </p>
      <p className="text-sm text-foreground-muted mb-8">
        Please check your inbox and click the activation link to activate your account.
      </p>
      <Link href="/login" className="w-full">
        <Button size="lg" className="w-full font-semibold">
          Go to sign in
        </Button>
      </Link>
    </div>
  );
}

// ─── Signup form ──────────────────────────────────────────────────────────────

export default function SignupPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const { error: toastError } = useToast();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const [registeredEmail, setRegisteredEmail] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<{
    fullName?: string; email?: string; password?: string; confirmPassword?: string;
  }>({});

  React.useEffect(() => {
    if (auth.isAuthenticated()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function validate(data: {
    fullName: string; email: string; password: string; confirmPassword: string;
  }) {
    const errs: typeof fieldErrors = {};
    if (!data.fullName.trim()) errs.fullName = "Full name is required";
    else if (data.fullName.trim().length < 2)
      errs.fullName = "Name must be at least 2 characters";

    if (!data.email) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errs.email = "Enter a valid email address";

    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 6)
      errs.password = "Password must be at least 6 characters";

    if (!data.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    return errs;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const data = {
      fullName: (fd.get("fullName") as string).trim(),
      email: (fd.get("email") as string).trim(),
      password: fd.get("password") as string,
      confirmPassword: fd.get("confirmPassword") as string,
    };

    const errs = validate(data);
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const imageFile = fd.get("profileImage");
    const profile: ProfileDTO = {
      fullName: data.fullName,
      email: data.email,
      password: data.password,
    };

    try {
      if (imageFile instanceof File && imageFile.size > 0) {
        profile.profileImageUrl = await uploadProfileImage(imageFile);
      }
      await authService.register(profile);
      setRegisteredEmail(data.email);
      setSuccess(true);
    } catch (err) {
      if (isApiError(err)) {
        if (err.status === 409 || err.status === 400) {
          setError("An account with this email already exists.");
        } else if (err.status === 0) {
          setError("Cannot connect to server. Make sure the backend is running.");
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
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
      <div className="hidden lg:block lg:h-screen"><SignupVisual /></div>

      <main className="flex h-[100svh] min-h-[560px] items-center justify-center px-4 py-3 sm:px-8 sm:py-4 lg:px-10 xl:px-16">
        <section className="my-3 max-h-[calc(100svh-1.5rem)] w-full max-w-[500px] overflow-y-auto rounded-[1.5rem] border border-white/80 bg-white/65 p-4 shadow-[0_25px_80px_rgba(8,95,98,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-6">
          {success ? <SuccessState email={registeredEmail} /> : <>
            <div className="mb-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5 lg:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm"><Wallet size={16} className="text-white" /></div><span className="font-bold tracking-tight text-foreground">Money Manager</span></div>
              <div className="flex w-full rounded-xl border border-primary/10 bg-primary/5 p-1 text-xs font-semibold text-foreground-muted sm:ml-auto sm:w-auto">
                <Link href="/login" className="flex-1 rounded-lg px-3 py-2 text-center whitespace-nowrap transition-colors hover:bg-white/70">Sign in</Link>
                <span className="flex-1 rounded-lg bg-primary px-3 py-2 text-center whitespace-nowrap text-white shadow-sm">Create account</span>
              </div>
            </div>

            <div className="mb-5"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">Your financial workspace</p><h2 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">Create your account</h2><p className="mt-1 text-sm text-foreground-muted">Start building better financial habits today.</p></div>

            <form onSubmit={handleSubmit} noValidate className="space-y-2.5">
              <Input label="Full name" name="fullName" type="text" autoComplete="name" placeholder="Alex Morgan" error={fieldErrors.fullName} leftIcon={<Wallet size={16} />} className="h-10 rounded-xl border-primary/10 bg-white/70 pl-10 shadow-[0_4px_16px_rgba(13,115,119,0.04)]" required />
              <Input label="Email address" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={fieldErrors.email} leftIcon={<Mail size={16} />} className="h-10 rounded-xl border-primary/10 bg-white/70 pl-10 shadow-[0_4px_16px_rgba(13,115,119,0.04)]" required />
              <Input label="Password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 6 characters" error={fieldErrors.password} leftIcon={<LockKeyhole size={16} />} rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightIconClick={() => setShowPassword((v) => !v)} className="h-10 rounded-xl border-primary/10 bg-white/70 pl-10 shadow-[0_4px_16px_rgba(13,115,119,0.04)]" required />
              <Input label="Confirm password" name="confirmPassword" type={showConfirm ? "text" : "password"} autoComplete="new-password" placeholder="Repeat your password" error={fieldErrors.confirmPassword} leftIcon={<LockKeyhole size={16} />} rightIcon={showConfirm ? <EyeOff size={16} /> : <Eye size={16} />} onRightIconClick={() => setShowConfirm((v) => !v)} className="h-10 rounded-xl border-primary/10 bg-white/70 pl-10 shadow-[0_4px_16px_rgba(13,115,119,0.04)]" required />
              <div className="space-y-1.5">
                <label htmlFor="profileImage" className="text-sm font-medium text-foreground">Profile picture <span className="text-foreground-muted">(optional)</span></label>
                <div className="flex items-center gap-3">
                  {imagePreview && <img src={imagePreview} alt="Profile preview" className="h-12 w-12 rounded-full object-cover" />}
                  <input
                    id="profileImage"
                    name="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      setImagePreview(file ? URL.createObjectURL(file) : "");
                    }}
                    className="w-full rounded-xl border border-primary/10 bg-white/70 px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              {error && <div className="rounded-xl border border-danger/20 bg-danger-light/70 px-3 py-2.5 text-sm text-danger">{error}</div>}
              <Button type="submit" size="xl" loading={loading} className="mt-1 h-10 w-full rounded-xl font-semibold shadow-[0_10px_25px_rgba(13,115,119,0.22)]">Create account <ArrowUpRight size={17} /></Button>
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
            <p className="mt-4 text-center text-sm text-foreground-muted">Already have an account? <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><ArrowLeft size={12} /> Sign in</Link></p>
          </>}
        </section>
      </main>
    </div>
  );
}
