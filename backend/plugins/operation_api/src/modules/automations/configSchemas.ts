import { describeConfigField as described } from 'erxes-api-shared/core-modules';
import { z } from 'zod/v4';

/**
 * Config contracts of operation's automation actions: what each handler reads
 * or refuses, published to authors as configJsonSchema.
 */

const requiredText = (description: string) =>
  described(z.string().trim().min(1), description);

const ids = z.union([z.string(), z.array(z.string())]);

// The builder writes these as text: comma-separated ids or a {{ }} variable.
const idsText = described(
  z.string(),
  'Comma-separated ids or a {{ }} variable, as text.',
);

// A {{ }} placeholder stands for a number until the run fills it.
const amount = z.union([z.number(), z.string()]);

export const taskCreateActionConfigSchema = z.object({
  name: requiredText('Task name; {{ }} placeholders allowed.'),
  teamId: requiredText('_id of the team the task belongs to.'),
  status: requiredText('_id of a status of that team.'),
  description: z.string().optional(),
  priority: amount.optional(),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
  milestoneId: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  labelIds: ids.optional(),
  tagIds: ids.optional(),
});

export const projectCreateActionConfigSchema = z
  .object({
    name: requiredText('Project name; {{ }} placeholders allowed.'),
    teamIds: described(
      z.array(z.string()),
      '_ids of the teams working on it, as a list.',
    ).optional(),
    teamId: z.string().optional(),
    description: z.string().optional(),
    status: amount.optional(),
    priority: amount.optional(),
    leadId: z.string().optional(),
    memberIds: idsText.optional(),
    startDate: z.string().optional(),
    targetDate: z.string().optional(),
    tagIds: idsText.optional(),
  })
  .refine(({ teamIds, teamId }) => !!teamId || !!teamIds?.length, {
    path: ['teamIds'],
    message: 'Required',
  });
