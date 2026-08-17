"use client";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateFormProps } from "@/templates/types";
import type { ProposalV2Data } from "./schema";

// Fixed for every proposal-v2 experience — proves a template can opt out of
// the generated `SchemaForm` (see `@/templates/schema-form`) to make a field
// non-editable instead of just another `Input`.
const FIXED_COMPANY = "Acme Inc.";

function toFieldErrors(messages?: string[]) {
  return messages?.map((message) => ({ message }));
}

export function ProposalV2Form({
  defaultData,
  fieldErrors,
}: TemplateFormProps<ProposalV2Data>) {
  return (
    <>
      <Field data-invalid={!!fieldErrors?.name}>
        <FieldLabel htmlFor="name">Name</FieldLabel>
        <Input
          id="name"
          name="name"
          defaultValue={defaultData?.name}
          aria-invalid={!!fieldErrors?.name}
          required
        />
        <FieldError errors={toFieldErrors(fieldErrors?.name)} />
      </Field>

      <Field>
        <FieldLabel htmlFor="company">Company</FieldLabel>
        <Input
          id="company"
          name="company"
          defaultValue={defaultData?.company ?? FIXED_COMPANY}
          readOnly
        />
        <FieldDescription>
          This template doesn&apos;t allow changing the company.
        </FieldDescription>
      </Field>

      <Field data-invalid={!!fieldErrors?.message}>
        <FieldLabel htmlFor="message">Message</FieldLabel>
        <Textarea
          id="message"
          name="message"
          defaultValue={defaultData?.message}
          aria-invalid={!!fieldErrors?.message}
          required
        />
        <FieldError errors={toFieldErrors(fieldErrors?.message)} />
      </Field>
    </>
  );
}
