import type { ComponentType } from "react";
import type { z } from "zod";

// Every template component gets its Experience's `data` plus the two
// identifiers that resolve it publicly. Templates that let visitors submit
// data back (e.g. an editable name) need these to call a public Server
// Action — see `@/lib/experiences/public-actions` — without ever trusting a
// client-held Experience id.
export type TemplateComponentProps<TData> = {
  data: TData;
  organizationSlug: string;
  experienceSlug: string;
};

// Props for a template's own admin edit-form (see `Template["form"]`
// below). `defaultData` is the existing Experience's `data` when editing,
// absent when creating; `fieldErrors` mirrors a failed
// `schema.safeParse(...)`'s `flatten().fieldErrors`.
export type TemplateFormProps<TData> = {
  defaultData?: TData;
  fieldErrors?: Record<string, string[]>;
};

// A template pairs a React component with the Zod schema that validates
// the `data` an Experience must provide to render it. `TData` defaults to
// `any` so a registry can hold templates with different, unrelated data
// shapes side by side (each template module still gets full inference).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry holds templates with unrelated data shapes
export type Template<TData = any> = {
  schema: z.ZodType<TData>;
  component: ComponentType<TemplateComponentProps<TData>>;
  // Optional custom admin edit-form fields for this template — rendered by
  // `ExperienceForm` instead of the generated SchemaForm
  form?: ComponentType<TemplateFormProps<TData>>;
};

// Templates for a single namespace (company), keyed by template id (e.g. "proposal-v1").
export type NamespaceTemplates = Record<string, Template>;
