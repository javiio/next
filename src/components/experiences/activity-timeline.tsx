import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  formatEventTimestamp,
  getTimelineEntry,
  type TimelineEvent,
} from "@/lib/experience-events/timeline";

// Purely presentational: given a list of already-fetched events (see
// `getExperienceEvents`), renders them as a vertical timeline. Knows nothing
// about how to fetch data or about specific event types — that's delegated
// to `getTimelineEntry`, so adding a new event type never requires touching
// this component.
export function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>No activity yet</EmptyTitle>
          <EmptyDescription>
            Views and clicks on this experience will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ol className="flex flex-col">
      {events.map((event, index) => {
        const entry = getTimelineEntry(event);
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={`flex flex-col gap-0.5 ${isLast ? "" : "pb-6"}`}>
              <p className="text-sm font-medium">{entry.title}</p>
              {entry.detail && (
                <p className="text-sm text-muted-foreground">
                  {entry.detail}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatEventTimestamp(event.occurredAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
