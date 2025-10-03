import { z } from 'zod';

export const TEAM_FORM_SCHEMA = z.object({
  name: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  memberIds: z.string().array().optional(),
});

export const TEAM_MEMBER_FORM_SCHEMA = z.object({
  memberIds: z.string().array().optional(),
});

export const TEAM_STATUS_FORM_SCHEMA = z.object({
  name: z.string().min(1).max(16),
  description: z.string().max(255).optional(),
  color: z.string().optional(),
});
