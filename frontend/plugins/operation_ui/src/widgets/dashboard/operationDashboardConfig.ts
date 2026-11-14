import { z } from 'zod';

export const MY_TASKS_DASHBOARD_LIMIT = 10;

// Messages are `operation` translation keys.
export const projectDashboardConfigSchema = z.object({
  teamId: z.string().min(1, 'dashboard.team-required'),
  projectId: z.string().min(1, 'dashboard.project-required'),
});

// `current` follows the team's active cycle as cycles roll over; `pick`
// pins one cycle.
export const cycleDashboardConfigSchema = z
  .object({
    teamId: z.string().min(1, 'dashboard.team-required'),
    cycleMode: z.enum(['current', 'pick']),
    cycleId: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.cycleMode === 'pick' && !value.cycleId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['cycleId'],
        message: 'dashboard.cycle-required',
      });
    }
  });

export type TProjectDashboardConfig = z.infer<
  typeof projectDashboardConfigSchema
>;
export type TCycleDashboardConfig = z.infer<typeof cycleDashboardConfigSchema>;
