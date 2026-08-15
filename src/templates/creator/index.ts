import type { NamespaceTemplates } from "../types";
import { ProposalV1 } from "./proposal-v1/component";
import { proposalV1Schema } from "./proposal-v1/schema";

// Templates owned by the "creator" namespace (our own default templates,
// as opposed to future per-company namespaces like "acme").
export const creatorTemplates = {
  "proposal-v1": {
    schema: proposalV1Schema,
    component: ProposalV1,
  },
} satisfies NamespaceTemplates;
