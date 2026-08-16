"use client";

import { Button } from "@/components/ui/button";
import { useTrackExperienceEvent } from "@/components/experiences/experience-event-tracker";
import type { ProposalV1Data } from "./schema";

// Intentionally simple: this proves the template pipeline, not the final design.
export function ProposalV1({ data }: { data: ProposalV1Data }) {
  const track = useTrackExperienceEvent();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-3xl font-semibold">¡Hola {data.name}!</h1>
      <p className="text-lg text-neutral-600">{data.company}</p>
      <p className="text-base text-neutral-800">{data.message}</p>
      <Button
        onClick={() => track("cta_clicked", { cta: "accept-proposal" })}
      >
        Accept proposal
      </Button>
    </main>
  );
}
