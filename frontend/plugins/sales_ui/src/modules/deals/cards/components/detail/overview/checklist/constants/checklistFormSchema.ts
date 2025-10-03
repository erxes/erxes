import { z } from "zod";

export const checklistFormSchema = z.object({
  title: z.string().default(""),
});

export type ChecklistFormType = z.infer<typeof checklistFormSchema>;
