"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Try access token first
        const res = await fetch("/api/auth/me");

        if (res.ok) {
          const data = await res.json();
          setAdmin(data.admin);
          setLoading(false);
          return;
        }

        // Access token expired (401) — try refresh token
        if (res.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", { method: "POST" });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            setAdmin(data.admin);
            setLoading(false);
            return;
          }
        }

        // Both failed — redirect to login
        router.push("/login");
      } catch {
        router.push("/login");
      }
    };

    verifyAuth();
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setAdmin(null);
    router.push("/login");
  };

  return { admin, loading, logout };
}
