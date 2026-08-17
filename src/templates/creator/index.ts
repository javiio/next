import type { NamespaceTemplates } from "../types";
import { ProposalV1 } from "./proposal-v1/component";
import { proposalV1Schema } from "./proposal-v1/schema";
import { ProposalV2 } from "./proposal-v2/component";
import { ProposalV2Form } from "./proposal-v2/form";
import { proposalV2Schema } from "./proposal-v2/schema";

// Templates owned by the "creator" namespace (our own default templates,
// as opposed to future per-company namespaces like "acme").
export const creatorTemplates = {
  "proposal-v1": {
    schema: proposalV1Schema,
    component: ProposalV1,
  },
  "proposal-v2": {
    schema: proposalV2Schema,
    component: ProposalV2,
    form: ProposalV2Form,
  },
} satisfies NamespaceTemplates;
