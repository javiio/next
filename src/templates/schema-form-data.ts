import { z } from "zod";

// Strips the wrapper types a template's schema commonly uses around a field
// (`.optional()`, `.nullable()`, `.default()`) so callers can inspect the
// actual underlying type, e.g. to tell a `z.boolean().default(false)` apart
// from a `z.string()`.
function unwrapZodType(schema: z.ZodTypeAny): z.ZodTypeAny {
  let current = schema;
  while (
    current instanceof z.ZodOptional ||
    current instanceof z.ZodNullable ||
    current instanceof z.ZodDefault
  ) {
    // `.unwrap()`'s return type is generic over the wrapper's inner type,
    // which TS can't narrow back down to the classic `ZodTypeAny` used
    // throughout this file — this is always a real Zod type at runtime.
    current = current.unwrap() as z.ZodTypeAny;
  }
  return current;
}

export function isBooleanField(schema: z.ZodTypeAny): boolean {
  return unwrapZodType(schema) instanceof z.ZodBoolean;
}

// A field is only "required" (and should get the HTML `required` attribute)
// when it has neither an explicit `.optional()` nor a `.default(...)` —
// either of those makes omitting it from a submission valid.
export function isRequiredField(schema: z.ZodTypeAny): boolean {
  return !(schema instanceof z.ZodOptional || schema instanceof z.ZodDefault);
}

// Builds the object to validate against a template's schema from a
// submitted `FormData`. This is schema-driven rather than a blind copy of
// `formData.entries()` for two reasons: it needs to know which keys are
// booleans (an unchecked `Switch`/checkbox is simply absent from
// `FormData`, so `false` must be inferred from *absence*, not read off an
// entry), and it naturally ignores form fields that aren't part of the
// template's own data (e.g. `templateId`, `experienceId`).
export function extractSchemaFormData(
  schema: z.ZodTypeAny,
  formData: FormData,
): Record<string, unknown> {
  if (!(schema instanceof z.ZodObject)) {
    return Object.fromEntries(formData.entries());
  }

  const shape = schema.shape as Record<string, z.ZodTypeAny>;
  const data: Record<string, unknown> = {};

  for (const [key, fieldSchema] of Object.entries(shape)) {
    if (isBooleanField(fieldSchema)) {
      data[key] = formData.has(key);
    } else if (formData.has(key)) {
      data[key] = formData.get(key);
    }
  }

  return data;
}
