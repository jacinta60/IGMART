"use client";

import { useSyncExternalStore } from "react";

export interface AuthUser {
  id: number;
  name: string;
  role: string;
}

function subscribe() {
  // The auth cookie only changes on login/logout, which already triggers a
  // full navigation, so there is nothing to subscribe to here.
  return () => {};
}

// Cache the parsed user so getSnapshot returns a stable reference (React
// requires getSnapshot to be referentially stable to avoid render loops).
let cachedCookie: string | null = null;
let cachedUser: AuthUser | null = null;

function readUser(): AuthUser | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="));
  if (cookie === cachedCookie) return cachedUser;
  cachedCookie = cookie ?? null;
  if (!cachedCookie) {
    cachedUser = null;
    return null;
  }
  try {
    cachedUser = JSON.parse(decodeURIComponent(cachedCookie.split("=")[1]));
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

/**
 * Reads the current auth user from the `auth_token` cookie.
 *
 * Uses useSyncExternalStore so the server snapshot (null) and the client
 * snapshot (parsed cookie) don't cause a hydration mismatch — React handles
 * the post-hydration switch automatically.
 */
export function useAuthUser(): AuthUser | null {
  return useSyncExternalStore(subscribe, readUser, () => null);
}
