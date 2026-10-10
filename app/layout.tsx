import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ToastProvider } from "@/components/ui/toast";
import { GoogleOAuthProviderWrapper } from "@/components/google-oauth-provider";

export const metadata: Metadata = {
  title: "Money Manager — Financial clarity, every day",
  description:
    "Track your income, understand your spending, and make smarter financial decisions — all in one place.",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>
          <ToastProvider>
            <GoogleOAuthProviderWrapper>{children}</GoogleOAuthProviderWrapper>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
