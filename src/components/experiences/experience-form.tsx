"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CircleAlertIcon } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createExperience,
  updateExperience,
  type ExperienceFormState,
} from "@/lib/experiences/actions";
import { listTemplateIds } from "@/templates";

const templateIds = listTemplateIds();

const initialState: ExperienceFormState = { status: "idle" };

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }));
}

// The existing Experience's `data` is only used here to pre-fill defaults —
// it's read loosely per-field below. The template's Zod schema remains the
// source of truth for actually validating a submission.
function readStringField(data: unknown, key: string): string | undefined {
  if (data && typeof data === "object" && key in data) {
    const value = (data as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}

export function ExperienceForm({
  experience,
  onSuccess,
  onCancel,
}: {
  experience?: {
    id: string;
    template: string;
    data: unknown;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const { organizationSlug } = useParams<{ organizationSlug: string }>();
  const isEditing = !!experience;
  const [templateId, setTemplateId] = useState(
    experience?.template ?? templateIds[0],
  );
  // `.bind` supplies `organizationSlug` as the action's first argument —
  // it's never trusted as-is; both actions still re-resolve and re-check it
  // server-side via `getOrganizationForCurrentUser`.
  const [state, formAction, isPending] = useActionState(
    (isEditing ? updateExperience : createExperience).bind(
      null,
      organizationSlug,
    ),
    initialState,
  );

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.();
    }
    // Only re-run when a new submission actually succeeds.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {isEditing && (
        <input type="hidden" name="experienceId" value={experience.id} />
      )}

      {state.status === "error" && state.message && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{state.message}</AlertTitle>
        </Alert>
      )}

      {state.status === "success" && !onSuccess && (
        <Alert>
          <AlertTitle>Saved.</AlertTitle>
        </Alert>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="templateId">Template</FieldLabel>
          <Select
            name="templateId"
            value={templateId}
            onValueChange={setTemplateId}
            disabled={isEditing}
          >
            <SelectTrigger id="templateId" className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templateIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            {isEditing
              ? "The template can't be changed after an experience is created."
              : "The template controls how this experience will be rendered."}
          </FieldDescription>
        </Field>

        {templateId === "creator/proposal-v1" && (
          <>
            <Field data-invalid={!!state.fieldErrors?.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={readStringField(experience?.data, "name")}
                aria-invalid={!!state.fieldErrors?.name}
                required
              />
              <FieldError errors={toFieldErrors(state.fieldErrors?.name)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors?.company}>
              <FieldLabel htmlFor="company">Company</FieldLabel>
              <Input
                id="company"
                name="company"
                defaultValue={readStringField(experience?.data, "company")}
                aria-invalid={!!state.fieldErrors?.company}
                required
              />
              <FieldError errors={toFieldErrors(state.fieldErrors?.company)} />
            </Field>

            <Field data-invalid={!!state.fieldErrors?.message}>
              <FieldLabel htmlFor="message">Message</FieldLabel>
              <Textarea
                id="message"
                name="message"
                defaultValue={readStringField(experience?.data, "message")}
                aria-invalid={!!state.fieldErrors?.message}
                required
              />
              <FieldError errors={toFieldErrors(state.fieldErrors?.message)} />
            </Field>
          </>
        )}
      </FieldGroup>

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button type="button" variant="outline" asChild>
            <Link href={`/${organizationSlug}/experiences`}>Cancel</Link>
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isEditing
            ? isPending
              ? "Saving..."
              : "Save changes"
            : isPending
              ? "Creating..."
              : "Create"}
        </Button>
      </div>
    </form>
  );
}
