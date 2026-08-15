import { z } from "zod";

export const proposalV1Schema = z.object({
  name: z.string(),
  company: z.string(),
  message: z.string(),
});

export type ProposalV1Data = z.infer<typeof proposalV1Schema>;
