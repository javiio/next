import { z } from "zod";

export const proposalV1Schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  company: z.string().trim().min(1, "Company is required"),
  message: z.string().trim().min(1, "Message is required"),
});

export type ProposalV1Data = z.infer<typeof proposalV1Schema>;
