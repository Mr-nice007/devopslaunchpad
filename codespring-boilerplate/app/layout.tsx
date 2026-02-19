import { getProfileByUserIdAction } from "@/actions/profiles-actions";
import { PaymentStatusAlert } from "@/components/payment/payment-status-alert";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/utilities/providers";
import LayoutWrapper from "@/components/layout-wrapper";
import { SessionProvider } from "@/components/auth/session-provider";
import { auth } from "@/auth";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createProfileAction } from "@/actions/profiles-actions";
import { claimPendingProfile } from "@/actions/whop-actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevOps Launchpad",
  description: "Practical DevOps training for beginners. Build real skills with guided labs in Git, CI/CD, Docker, and cloud."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (userId) {
    try {
      const res = await getProfileByUserIdAction(userId);
      if (!res.data) {
        const email = session.user?.email ?? undefined;
        if (email) {
          const claimResult = await claimPendingProfile(userId, email);
          if (!claimResult.success) {
            await createProfileAction({ userId, email });
          }
        } else {
          await createProfileAction({ userId });
        }
      }
    } catch (error) {
      console.error("Error checking/creating user profile:", error);
    }
  }

  return (
    <SessionProvider>
      <html lang="en">
        <body className={inter.className}>
          <Providers
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <LayoutWrapper>
              {userId && <PaymentStatusAlert />}
              {children}
            </LayoutWrapper>
            <Toaster />
          </Providers>
        </body>
      </html>
    </SessionProvider>
  );
}
