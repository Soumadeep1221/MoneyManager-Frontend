"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  LoaderCircle,
  Wallet,
} from "lucide-react";
import { activationService } from "@/lib/api";
import { Button } from "@/components/ui/button";

type ActivationState = "ready" | "loading" | "success" | "already-active" | "error";

export default function ActivatePage() {
  const [token, setToken] = React.useState("");
  const [state, setState] = React.useState<ActivationState>("ready");

  React.useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function handleActivate() {
    if (!token) {
      setState("error");
      return;
    }

    setState("loading");
    try {
      const response = await activationService.activate(token);
      if (response.status === "ACTIVATED") {
        setState("success");
      } else if (response.status === "ALREADY_ACTIVE") {
        setState("already-active");
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  const completed = state === "success" || state === "already-active" || state === "error";
  const isLoading = state === "loading";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e8fbf6] px-4 py-8">
      <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-[#b8f5e5]/70 blur-3xl" />

      <section className="relative w-full max-w-md rounded-[1.5rem] border border-white/80 bg-white/75 p-6 text-center shadow-[0_25px_80px_rgba(8,95,98,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl sm:p-9">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Wallet size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Money Manager
          </span>
        </div>

        {!completed ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
              <Wallet size={30} />
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
              Activate Your Account
            </h1>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">
              Click below to verify your email and activate your Money Manager account.
            </p>
            <Button
              type="button"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onClick={handleActivate}
              className="mt-7 w-full"
            >
              {isLoading ? "Activating account" : "Activate Account"}
            </Button>
          </>
        ) : (
          <>
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                state === "success"
                  ? "border-2 border-success/30 bg-success-light text-success"
                  : state === "already-active"
                    ? "border-2 border-primary/20 bg-primary-light text-primary"
                    : "border-2 border-danger/20 bg-danger-light text-danger"
              }`}
            >
              {state === "success" ? (
                <CheckCircle2 size={32} />
              ) : state === "already-active" ? (
                <Info size={32} />
              ) : (
                <CircleAlert size={32} />
              )}
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
              {state === "success"
                ? "Profile activated successfully"
                : state === "already-active"
                  ? "Your account is already activated"
                  : "Activation token invalid or expired"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-foreground-muted">
              {state === "error"
                ? "Please request a new activation link or create an account again."
                : "You can now continue to the sign in page."}
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  {state === "error" ? "Go to Login" : "Go to Login"}
                </Button>
              </Link>
              {state === "error" && (
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Create account
                  </Button>
                </Link>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
