import { z } from "zod";

export const salesFormSchema = z.object({
  name: z.string().default(""),
  description: z.string().default(""),
  assignedUserIds: z.array(z.string()).optional(),
  companyIds: z.array(z.string()).optional(),
  customerIds: z.array(z.string()).optional(),
  labelIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
});

export type SalesFormType = z.infer<typeof salesFormSchema>;
