import type { ExperienceEventData, ExperienceEventType } from "./event-types";

export type TimelineEvent = {
  id: string;
  eventType: string;
  eventData: unknown;
  occurredAt: Date;
  userAgent: string | null;
  referrer: string | null;
};

export type TimelineEntry = {
  title: string;
  detail: string | null;
};

// Turns "accept-proposal" / "link_clicked" into "Accept proposal" / "Link
// clicked" — used both as a fallback title for event types without a
// dedicated formatter below, and to render arbitrary `cta` ids.
function humanize(value: string): string {
  const spaced = value.replace(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Well-known referrer hosts get a friendly label; anything else falls back
// to its bare hostname, and no referrer at all is "Direct" (matches the
// common analytics convention).
const KNOWN_REFERRER_SOURCES: Record<string, string> = {
  "linkedin.com": "LinkedIn",
  "twitter.com": "Twitter",
  "x.com": "X",
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "google.com": "Google",
  "youtube.com": "YouTube",
  "tiktok.com": "TikTok",
  "reddit.com": "Reddit",
  "producthunt.com": "Product Hunt",
};

function formatReferrerSource(referrer: string | null): string {
  if (!referrer) {
    return "Direct";
  }

  try {
    const hostname = new URL(referrer).hostname.replace(/^www\./, "");
    const knownSource = Object.entries(KNOWN_REFERRER_SOURCES).find(
      ([domain]) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
    return knownSource?.[1] ?? hostname;
  } catch {
    return "Direct";
  }
}

// Deliberately simple substring checks rather than a full user-agent
// parsing library — order matters, since e.g. Edge and Chrome both include
// "Safari/" and "Chrome/" tokens in their UA string.
function formatBrowser(userAgent: string | null): string | null {
  if (!userAgent) {
    return null;
  }

  if (/Edg\//.test(userAgent)) return "Edge";
  if (/OPR\/|Opera/.test(userAgent)) return "Opera";
  if (/FxiOS/.test(userAgent)) return "Firefox";
  if (/CriOS/.test(userAgent)) return "Chrome";
  if (/Firefox\//.test(userAgent)) return "Firefox";
  if (/Chrome\//.test(userAgent)) return "Chrome";
  if (/Version\/.*Safari\//.test(userAgent)) return "Safari";
  return "Other";
}

// One formatter per known event type — this is the extension point for
// future event types (e.g. `link_clicked`, `video_started`): add a schema to
// `event-types.ts`, then a formatter here. Anything not registered still
// renders via `getTimelineEntry`'s fallback below instead of crashing.
//
// `eventData` comes in as `unknown` (rather than each formatter declaring
// its own `ExperienceEventData[T]`) because dispatching dynamically by a
// union-typed key otherwise makes TypeScript require every formatter's
// parameter to satisfy the *intersection* of all of them. Each formatter
// casts to its own type below instead — safe in practice since rows only
// ever get written after passing that same event type's Zod schema.
type TimelineFormatter = (event: {
  eventData: unknown;
  userAgent: string | null;
  referrer: string | null;
}) => TimelineEntry;

const timelineFormatters: Record<ExperienceEventType, TimelineFormatter> = {
  viewed: ({ userAgent, referrer }) => ({
    title: "Experience viewed",
    detail: [formatReferrerSource(referrer), formatBrowser(userAgent)]
      .filter((part): part is string => !!part)
      .join(" · "),
  }),
  cta_clicked: ({ eventData }) => {
    const data = eventData as ExperienceEventData["cta_clicked"];
    return { title: "CTA clicked", detail: humanize(data.cta) };
  },
};

function isKnownEventType(
  eventType: string,
): eventType is ExperienceEventType {
  return eventType in timelineFormatters;
}

export function getTimelineEntry(event: TimelineEvent): TimelineEntry {
  if (isKnownEventType(event.eventType)) {
    return timelineFormatters[event.eventType]({
      eventData: event.eventData,
      userAgent: event.userAgent,
      referrer: event.referrer,
    });
  }

  // Defensive fallback for event types recorded by a newer build than the
  // one currently rendering the timeline — never crash on unknown data.
  return { title: humanize(event.eventType), detail: null };
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

// `now` is a parameter (rather than always `new Date()`) purely to make this
// testable; every real call site just omits it.
export function formatEventTimestamp(
  occurredAt: Date,
  now: Date = new Date(),
): string {
  const diffMs = now.getTime() - occurredAt.getTime();

  if (diffMs < MINUTE_MS) {
    return "Just now";
  }
  if (diffMs < HOUR_MS) {
    const minutes = Math.floor(diffMs / MINUTE_MS);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (occurredAt.toDateString() === now.toDateString()) {
    const hours = Math.floor(diffMs / HOUR_MS);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (occurredAt.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${timeFormatter.format(occurredAt)}`;
  }

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: occurredAt.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
  return `${dateFormatter.format(occurredAt)}, ${timeFormatter.format(occurredAt)}`;
}
