"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/api";
import { Spinner } from "@/components/ui/spinner";

/**
 * Root page — immediately redirects based on auth state.
 * Authenticated  → /dashboard
 * Unauthenticated → /login
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f8f9]">
      <Spinner size="lg" />
    </div>
  );
}
