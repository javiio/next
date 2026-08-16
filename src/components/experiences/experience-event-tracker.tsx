"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useTransition,
  type ReactNode,
} from "react";
import {
  getOrCreateSessionId,
  getOrCreateVisitorId,
} from "@/lib/experience-events/client";
import { trackExperienceEvent } from "@/lib/experience-events/actions";
import type { ExperienceEventData, ExperienceEventType } from "@/lib/experience-events/event-types";

// `data`'s shape depends on `eventType` (e.g. `cta_clicked` requires
// `{ cta: string }`, `viewed` requires `{}`) — always passed explicitly
// (rather than made optional for empty-schema event types) since TypeScript
// can't resolve a conditionally-optional rest parameter against a generic
// that's still being inferred at the call site.
type TrackFn = <T extends ExperienceEventType>(
  eventType: T,
  data: ExperienceEventData[T],
) => void;

const ExperienceTrackingContext = createContext<TrackFn | null>(null);

// Lets a template component (or any descendant) fire an event without
// having to know the current Experience's organization/slug, visitor id, or
// session id — those live here. This is the extension point future event
// types (e.g. `link_clicked`, `video_started`) will call into; templates
// just import this hook, no plumbing changes needed elsewhere.
export function useTrackExperienceEvent(): TrackFn {
  const track = useContext(ExperienceTrackingContext);
  if (!track) {
    throw new Error(
      "useTrackExperienceEvent must be used within an ExperienceEventTracker",
    );
  }
  return track;
}

// Wraps a public Experience's rendered template. Fires a `viewed` event once
// per mount, and provides `useTrackExperienceEvent` to descendants for
// interaction events like `cta_clicked`.
export function ExperienceEventTracker({
  organizationSlug,
  experienceSlug,
  children,
}: {
  organizationSlug: string;
  experienceSlug: string;
  children: ReactNode;
}) {
  const [, startTransition] = useTransition();
  const hasTrackedView = useRef(false);

  // Written as a standalone generic function (rather than a `const` typed
  // as `TrackFn`) so `T` is actually bound per call — assigning an arrow
  // function straight to a generic function type doesn't give the body
  // access to that per-call `T`.
  function track<T extends ExperienceEventType>(
    eventType: T,
    data: ExperienceEventData[T],
  ) {
    startTransition(async () => {
      try {
        await trackExperienceEvent({
          organizationSlug,
          experienceSlug,
          eventType,
          eventData: data,
          visitorId: getOrCreateVisitorId(),
          sessionId: getOrCreateSessionId(),
          referrer: document.referrer || null,
        });
      } catch {
        // Tracking is best-effort — never let it disrupt the visitor.
      }
    });
  }

  useEffect(() => {
    if (hasTrackedView.current) {
      return;
    }
    hasTrackedView.current = true;
    track("viewed", {});
    // Intentionally only on mount — `organizationSlug`/`experienceSlug` are
    // stable for the lifetime of this component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ExperienceTrackingContext.Provider value={track}>
      {children}
    </ExperienceTrackingContext.Provider>
  );
}
