import { useMemo } from 'react';
import { TDashboardWidgetConfig } from 'ui-modules';
import {
  SALES_LOYALTY_WIDGET_DEFAULT_CONFIG,
  salesLoyaltyWidgetConfigSchema,
} from '../salesDashboardConfig';

/**
 * A tile's stored config as the deal score log queries take it; a config
 * that no longer parses reads as every pipeline, by week.
 */
export const useSalesLoyaltyWidgetFilters = (
  config?: TDashboardWidgetConfig | null,
) =>
  useMemo(() => {
    const parsed = salesLoyaltyWidgetConfigSchema.safeParse(config);
    const { boardId, pipelineIds, interval } = parsed.success
      ? parsed.data
      : SALES_LOYALTY_WIDGET_DEFAULT_CONFIG;

    return {
      interval,
      filters: {
        boardIds: boardId ? [boardId] : undefined,
        pipelineIds: pipelineIds.length ? pipelineIds : undefined,
      },
    };
  }, [config]);
