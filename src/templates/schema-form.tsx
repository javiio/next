"use client";

import { z } from "zod";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { isBooleanField, isRequiredField } from "./schema-form-data";

function humanizeFieldName(key: string): string {
  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .toLowerCase()
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }));
}

function readField(data: unknown, key: string): unknown {
  if (data && typeof data === "object" && key in data) {
    return (data as Record<string, unknown>)[key];
  }
  return undefined;
}

// The default admin edit-form for any template that doesn't provide its own
// `form` (see `Template["form"]` in `./types`): one `Field` per key in the
// template's Zod object schema, driven purely by introspecting it — a
// `boolean` renders as a `Switch`, everything else as an `Input`. Meant to
// be rendered directly inside the caller's own `FieldGroup` (see
// `ExperienceForm`), not wrap one itself.
export function SchemaForm({
  schema,
  defaultData,
  fieldErrors,
}: {
  schema: z.ZodTypeAny;
  defaultData?: unknown;
  fieldErrors?: Record<string, string[]>;
}) {
  if (!(schema instanceof z.ZodObject)) {
    return null;
  }

  const shape = schema.shape as Record<string, z.ZodTypeAny>;

  return (
    <>
      {Object.entries(shape).map(([key, fieldSchema]) => {
        const errors = fieldErrors?.[key];
        const label = humanizeFieldName(key);
        const defaultValue = readField(defaultData, key);

        if (isBooleanField(fieldSchema)) {
          return (
            <Field key={key} orientation="horizontal" data-invalid={!!errors}>
              <FieldLabel htmlFor={key}>{label}</FieldLabel>
              <Switch
                id={key}
                name={key}
                defaultChecked={defaultValue === true}
                aria-invalid={!!errors}
              />
              <FieldError errors={toFieldErrors(errors)} />
            </Field>
          );
        }

        return (
          <Field key={key} data-invalid={!!errors}>
            <FieldLabel htmlFor={key}>{label}</FieldLabel>
            <Input
              id={key}
              name={key}
              defaultValue={
                typeof defaultValue === "string" ? defaultValue : undefined
              }
              aria-invalid={!!errors}
              required={isRequiredField(fieldSchema)}
            />
            <FieldError errors={toFieldErrors(errors)} />
          </Field>
        );
      })}
    </>
  );
}
