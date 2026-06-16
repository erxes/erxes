import { z } from 'zod';

export const checklistActionItemConfigFormSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  isChecked: z.boolean().default(false),
});

export const checklistActionConfigFormSchema = z.object({
  name: z.string().min(1),
  items: z.array(checklistActionItemConfigFormSchema).default([]),
});

export type TChecklistActionConfigForm = z.infer<
  typeof checklistActionConfigFormSchema
>;
