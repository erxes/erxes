import { z } from 'zod';

export const AUTOMATION_DASHBOARD_LIST_MAX = 5;
export const AUTOMATION_DASHBOARD_RUNS_LIMIT = 5;
export const AUTOMATION_DASHBOARD_STATS_DAYS = [7, 30, 90] as const;

// Messages are `automations` translation keys.
export const automationListConfigSchema = z.object({
  automationIds: z
    .array(z.string())
    .min(1, 'dashboard-pick-at-least-one')
    .max(AUTOMATION_DASHBOARD_LIST_MAX),
});

export const automationRunsConfigSchema = z.object({
  automationId: z.string().min(1, 'dashboard-pick-automation-required'),
});

export const automationStatsConfigSchema = z.object({
  automationId: z.string().min(1, 'dashboard-pick-automation-required'),
  days: z.union([z.literal(7), z.literal(30), z.literal(90)]),
});

export type TAutomationListConfig = z.infer<typeof automationListConfigSchema>;
export type TAutomationRunsConfig = z.infer<typeof automationRunsConfigSchema>;
export type TAutomationStatsConfig = z.infer<
  typeof automationStatsConfigSchema
>;

export type TAutomationStatsSection =
  | 'overview'
  | 'activity'
  | 'chart'
  | 'errors'
  | 'nodes';
