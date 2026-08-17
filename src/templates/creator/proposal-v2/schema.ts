// Same data shape as proposal-v1 — this template only differs in the admin
// edit form it provides (see `./form`), which doesn't let `company` be
// changed. Reusing the schema keeps that guarantee explicit instead of
// duplicating an identical `z.object(...)` that could quietly drift.
export { proposalV1Schema as proposalV2Schema } from "../proposal-v1/schema";
export type { ProposalV1Data as ProposalV2Data } from "../proposal-v1/schema";
