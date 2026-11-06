import { z } from 'zod';

// `module` names the core asks `./dashboardWidget` to draw; they match the
// `widgets.dashboardWidgets` entries in config.tsx.
export const SALES_DASHBOARD_MODULES = {
  loyaltyKpis: 'loyaltyKpis',
  loyaltyFlow: 'loyaltyFlow',
  loyaltyRunningNet: 'loyaltyRunningNet',
  loyaltyByPipeline: 'loyaltyByPipeline',
  loyaltyTopDeals: 'loyaltyTopDeals',
  loyaltyTopEarners: 'loyaltyTopEarners',
  loyaltyTopSpenders: 'loyaltyTopSpenders',
} as const;

export type TSalesDashboardModule =
  (typeof SALES_DASHBOARD_MODULES)[keyof typeof SALES_DASHBOARD_MODULES];

// The timeline widgets also pick the period they cut the points by.
export const SALES_DASHBOARD_TIMELINE_MODULES: string[] = [
  SALES_DASHBOARD_MODULES.loyaltyFlow,
  SALES_DASHBOARD_MODULES.loyaltyRunningNet,
];

// No board: every pipeline the viewer may see. A board without pipelines:
// all of that board's pipelines.
export const salesLoyaltyWidgetConfigSchema = z.object({
  boardId: z.string().optional(),
  pipelineIds: z.array(z.string()),
  interval: z.enum(['day', 'week', 'month']),
});

export type TSalesLoyaltyWidgetConfig = z.infer<
  typeof salesLoyaltyWidgetConfigSchema
>;

export const SALES_LOYALTY_WIDGET_DEFAULT_CONFIG: TSalesLoyaltyWidgetConfig = {
  boardId: undefined,
  pipelineIds: [],
  interval: 'week',
};

export const SALES_LOYALTY_POINTS_PATH = '/sales/deals/loyalty';
