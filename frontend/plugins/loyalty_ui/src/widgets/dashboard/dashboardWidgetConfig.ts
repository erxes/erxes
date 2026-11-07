import { z } from 'zod';

// Module names of `widgets.dashboardWidgets` in config.tsx.
export const LOYALTY_DASHBOARD_MODULES = {
  scoreSummary: 'scoreSummary',
  recentScoreLogs: 'recentScoreLogs',
  recentVouchers: 'recentVouchers',
  recentCoupons: 'recentCoupons',
} as const;

export const LOYALTY_DASHBOARD_LIST_LIMIT = 10;

// 0 is "all time".
export const LOYALTY_DASHBOARD_PERIODS = [7, 30, 90, 0] as const;

export const scoreSummaryConfigSchema = z.object({
  campaignId: z.string().optional(),
  days: z.union([z.literal(7), z.literal(30), z.literal(90), z.literal(0)]),
});

export const recentScoreLogsConfigSchema = z.object({
  campaignId: z.string().optional(),
});

export const recentVouchersConfigSchema = z.object({
  kind: z.enum(['issued', 'redeemed']),
});

export type TScoreSummaryConfig = z.infer<typeof scoreSummaryConfigSchema>;
export type TRecentScoreLogsConfig = z.infer<
  typeof recentScoreLogsConfigSchema
>;
export type TRecentVouchersConfig = z.infer<typeof recentVouchersConfigSchema>;

export const SCORE_SUMMARY_DEFAULTS: TScoreSummaryConfig = { days: 30 };
export const RECENT_VOUCHERS_DEFAULTS: TRecentVouchersConfig = {
  kind: 'issued',
};
