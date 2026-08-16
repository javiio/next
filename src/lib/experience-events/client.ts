"use client";

// Cookie-based visitor/session identity for public Experience pages — no
// login, so these are the only handles we have to tell "one visitor, many
// events" apart. Plain (non-httpOnly) cookies are fine here since nothing
// sensitive is stored, only a random id, and it needs to be readable from
// client components to accompany every tracked event.

const VISITOR_ID_COOKIE = "experience_visitor_id";
const SESSION_ID_COOKIE = "experience_session_id";

// ~13 months, matching the common analytics-cookie convention (and under
// Chrome's ~400-day cap on `Max-Age`) so a returning visitor is still
// recognized as the same visitor next quarter.
const VISITOR_ID_MAX_AGE_SECONDS = 13 * 30 * 24 * 60 * 60;

function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, maxAgeSeconds?: number) {
  const maxAge =
    maxAgeSeconds !== undefined ? `; max-age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/${maxAge}; samesite=lax`;
}

function getOrCreateId(
  cookieName: string,
  maxAgeSeconds?: number,
): string {
  const existing = readCookie(cookieName);
  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  writeCookie(cookieName, id, maxAgeSeconds);
  return id;
}

// Long-lived: identifies the same browser across visits.
export function getOrCreateVisitorId(): string {
  return getOrCreateId(VISITOR_ID_COOKIE, VISITOR_ID_MAX_AGE_SECONDS);
}

// No `max-age` — a plain session cookie, cleared when the browser closes, so
// "session" here means "one browsing session" rather than a fixed duration.
export function getOrCreateSessionId(): string {
  return getOrCreateId(SESSION_ID_COOKIE);
}
