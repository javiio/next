import type { NamespaceTemplates, Template } from "./types";
import { creatorTemplates } from "./creator";

// Central registry: one entry per namespace (company). Adding a new company's
// templates means adding one line here, not touching any resolution logic.
const namespaces: Record<string, NamespaceTemplates> = {
  creator: creatorTemplates,
};

// Experiences store a namespaced template id, e.g. "creator/proposal-v1".
// This keeps the identifier future-proof for other companies' templates
// (e.g. "acme/proposal-v1") without ever needing an `if (template === ...)`
// chain elsewhere in the app.
export function getTemplate(templateId: string): Template | undefined {
  const [namespace, ...rest] = templateId.split("/");
  const templateName = rest.join("/");

  return namespaces[namespace]?.[templateName];
}
