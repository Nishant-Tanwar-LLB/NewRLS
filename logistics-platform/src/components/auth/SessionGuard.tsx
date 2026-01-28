"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    // 1. Check if we are logged in
    if (session) {
      // 2. Check if our "Tab Flag" exists in Session Storage
      // (Session Storage survives refreshes, but DIES on tab close)
      const isTabActive = sessionStorage.getItem("RLS_SESSION_ACTIVE");

      if (!isTabActive) {
        // If flag is missing, it means this is a fresh tab/window.
        // FORCE LOGOUT immediately.
        signOut({ callbackUrl: "/login" });
      }
    }
  }, [session]);

  return <>{children}</>;
}