import { z } from 'zod';

/** Workflow create/edit form. The definition stays a controlled raw-JSON text
 *  field; we only assert it parses so the save handler can rely on valid JSON. */
export const workflowFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  isEnabled: z.boolean(),
  definitionText: z.string().refine((text) => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  }, 'Definition must be valid JSON'),
});

export type WorkflowFormValues = z.infer<typeof workflowFormSchema>;
