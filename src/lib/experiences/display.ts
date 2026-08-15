// The Experience name isn't a dedicated column yet — it lives inside the
// template-defined `data` JSONB blob. Fall back to the slug when a template's
// data doesn't happen to include a `name` field.
export function getExperienceDisplayName(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "name" in data &&
    typeof (data as Record<string, unknown>).name === "string"
  ) {
    return (data as { name: string }).name;
  }

  return fallback;
}
