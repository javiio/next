import type { ComponentType } from "react";
import type { z } from "zod";

// A template pairs a React component with the Zod schema that validates
// the `data` an Experience must provide to render it. `TData` defaults to
// `any` so a registry can hold templates with different, unrelated data
// shapes side by side (each template module still gets full inference).
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- registry holds templates with unrelated data shapes
export type Template<TData = any> = {
  schema: z.ZodType<TData>;
  component: ComponentType<{ data: TData }>;
};

// Templates for a single namespace (company), keyed by template id (e.g. "proposal-v1").
export type NamespaceTemplates = Record<string, Template>;
