"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth.store";
import { useWishlistStore } from "../../store/wishlist.store";
import { IntroScreen } from "../intro/IntroScreen";
import { Navbar } from "../nav/Navbar";
import { SocialDock } from "../social/SocialDock";
import { CustomCursor } from "../ui/CustomCursor";
import { Footer } from "./Footer";

const ReactiveBackground = dynamic(
  () => import("../background/ReactiveBackground").then((m) => m.ReactiveBackground),
  { ssr: false }
);

export function AppShell({ children }: { children: React.ReactNode }) {
  const [introDone, setIntroDone] = useState(false);
  const { user, accessToken, refreshToken } = useAuthStore();
  const { fetch: fetchWishlist } = useWishlistStore();

  useEffect(() => {
    if (accessToken) {
      fetchWishlist(accessToken);
    }
  }, [accessToken, fetchWishlist]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (useAuthStore.getState().user) {
        refreshToken();
      }
    }, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken]);

  return (
    <>
      <IntroScreen onDone={() => setIntroDone(true)} />
      <ReactiveBackground />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10 min-h-screen">{children}</main>
      <Footer />
      <SocialDock />
      <span data-intro-done={introDone} className="hidden" aria-hidden />
    </>
  );
}
