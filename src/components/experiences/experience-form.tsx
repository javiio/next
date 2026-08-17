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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createExperience,
  updateExperience,
  type ExperienceFormState,
} from "@/lib/experiences/actions";
import { getTemplate, listTemplateIds } from "@/templates";
import { SchemaForm } from "@/templates/schema-form";

const templateIds = listTemplateIds();

const initialState: ExperienceFormState = { status: "idle" };

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
  const template = getTemplate(templateId);
  const TemplateForm = template?.form;
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

        {template &&
          (TemplateForm ? (
            <TemplateForm
              defaultData={experience?.data}
              fieldErrors={state.fieldErrors}
            />
          ) : (
            <SchemaForm
              schema={template.schema}
              defaultData={experience?.data}
              fieldErrors={state.fieldErrors}
            />
          ))}
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
