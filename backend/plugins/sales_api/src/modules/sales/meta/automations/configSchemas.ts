import { describeConfigField as described } from 'erxes-api-shared/core-modules';
import { z } from 'zod/v4';

/**
 * Config contracts of sales' automation actions: what each handler reads or
 * refuses, published to authors as configJsonSchema.
 */

const requiredText = (description: string) =>
  described(z.string().trim().min(1), description);

const ids = z.union([z.string(), z.array(z.string())]);

// The builder writes these as text: comma-separated ids or a {{ }} variable.
const idsText = described(
  z.string(),
  'Comma-separated ids or a {{ }} variable, as text.',
);

export const dealCreateActionConfigSchema = z
  .object({
    boardId: described(z.string(), '_id of the sales board.').optional(),
    pipelineId: described(
      z.string(),
      '_id of a pipeline of that board.',
    ).optional(),
    stageId: requiredText('_id of the stage the deal starts in.'),
    name: described(
      z.string(),
      'Deal name; {{ }} placeholders allowed.',
    ).optional(),
    cardName: z.string().optional(),
    description: z.string().optional(),
    assignedTo: described(
      z.string(),
      'User _ids assigned to the deal, comma-separated, as text.',
    ).optional(),
    customers: ids.optional(),
    companies: ids.optional(),
    closeDate: z.string().optional(),
    startDate: z.string().optional(),
    labelIds: idsText.optional(),
    tagIds: idsText.optional(),
    priority: z.string().optional(),
  })
  .refine(({ name, cardName }) => !!(name || cardName)?.trim(), {
    path: ['name'],
    message: 'Required',
  });

export const checklistCreateActionConfigSchema = z.object({
  name: requiredText(
    'Checklist name, added to the deal that triggered the run.',
  ),
  items: z
    .array(
      z.object({
        id: z.string().optional(),
        label: z.string().min(1),
        isChecked: z.boolean().optional(),
      }),
    )
    .optional(),
});
