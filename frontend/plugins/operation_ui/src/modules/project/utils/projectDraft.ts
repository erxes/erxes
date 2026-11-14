import { z } from 'zod';
import { addProjectSchema } from '../types/validations';

export const projectDraftSchema = addProjectSchema.extend({
  name: z.string().trim().min(1, 'Name is required'),
  customerId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

export type TProjectDraft = z.infer<typeof projectDraftSchema>;

export const getProjectDraft = (
  defaults: Partial<TProjectDraft>,
  teamId?: string,
  firstTeamId?: string,
): TProjectDraft => ({
  name: '',
  icon: 'IconBox',
  status: 2,
  priority: 0,
  memberIds: [],
  tagIds: [],
  ...defaults,
  teamIds:
    defaults.teamIds ?? (teamId ? [teamId] : firstTeamId ? [firstTeamId] : []),
});
