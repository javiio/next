// The Experience name isn't a dedicated column yet — it lives inside the
// template-defined `data` JSONB blob. Templates aren't guaranteed to have a
// `name` field, so every reader here treats it as optional.
function readNameFromData(data: unknown): string | null {
  if (
    data &&
    typeof data === "object" &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string"
  ) {
    return (data as { name: string }).name;
  }

  return null;
}

// Fall back to the slug when a template's data doesn't include a `name`.
export function getExperienceDisplayName(data: unknown, fallback: string) {
  return readNameFromData(data) ?? fallback;
}

// Used to derive a slug for a not-yet-created experience, before it has one.
export function getExperienceNameForSlug(data: unknown) {
  return readNameFromData(data) ?? "experience";
}
