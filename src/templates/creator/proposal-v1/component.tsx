"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTrackExperienceEvent } from "@/components/experiences/experience-event-tracker";
import { updatePublicExperienceName } from "@/lib/experiences/public-actions";
import type { TemplateComponentProps } from "@/templates/types";
import type { ProposalV1Data } from "./schema";

// Lets any visitor (no login) correct/personalize their own name inline —
// writes go through the public `updatePublicExperienceName` Server Action,
// never a direct db call from the client, and only ever touch `name`.
function NameEditForm({
  name,
  onSaved,
  organizationSlug,
  experienceSlug,
}: {
  name: string;
  onSaved: (previousName: string, newName: string) => void;
  organizationSlug: string;
  experienceSlug: string;
}) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updatePublicExperienceName({
        organizationSlug,
        experienceSlug,
        name: trimmed,
      });
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      onSaved(name, trimmed);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full flex-col gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left"
    >
      <Field data-invalid={!!error} orientation="responsive">
        <Input
          aria-label="Your name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={isPending}
        />
        <Button
          type="submit"
          size="sm"
          disabled={isPending || !value.trim() || value.trim() === name}
        >
          {isPending ? "Saving..." : "Save name"}
        </Button>
      </Field>
      <FieldError errors={error ? [{ message: error }] : undefined} />
    </form>
  );
}

// Intentionally simple: this proves the template pipeline, not the final design.
export function ProposalV1({
  data,
  organizationSlug,
  experienceSlug,
}: TemplateComponentProps<ProposalV1Data>) {
  const track = useTrackExperienceEvent();
  const [name, setName] = useState(data.name);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 p-8 text-center">
      <NameEditForm
        name={name}
        organizationSlug={organizationSlug}
        experienceSlug={experienceSlug}
        onSaved={(previousName, newName) => {
          setName(newName);
          track("name_updated", { previousName, newName });
        }}
      />
      <h1 className="text-3xl font-semibold">¡Hola {name}!</h1>
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
