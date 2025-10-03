import { z } from "zod";

export const salesFormSchema = z.object({
  name: z.string().default("")
});

export type SalesFormType = z.infer<typeof salesFormSchema>;
