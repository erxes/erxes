import { TDashboardWidgetConfig } from 'ui-modules';
import { useDealScoreLogInsightsQuery } from '@/deals/loyaltyRules/hooks/useDealScoreLogInsights';
import { useDealScoreLogTimelineQuery } from '@/deals/loyaltyRules/hooks/useDealScoreLogTimeline';
import { useLoyaltyEnabled } from '@/deals/loyaltyRules/hooks/useLoyaltyEnabled';
import { useSalesLoyaltyWidgetFilters } from './useSalesLoyaltyWidgetFilters';

/** Loyalty's sums over the tile's pipelines; nothing is asked without loyalty. */
export const useSalesLoyaltyWidgetInsights = (
  config?: TDashboardWidgetConfig | null,
) => {
  const loyaltyEnabled = useLoyaltyEnabled();
  const { filters } = useSalesLoyaltyWidgetFilters(config);

  return {
    loyaltyEnabled,
    ...useDealScoreLogInsightsQuery(filters, !loyaltyEnabled),
  };
};

/** The tile's pipelines per its chosen period. */
export const useSalesLoyaltyWidgetTimeline = (
  config?: TDashboardWidgetConfig | null,
) => {
  const loyaltyEnabled = useLoyaltyEnabled();
  const { filters, interval } = useSalesLoyaltyWidgetFilters(config);

  return {
    loyaltyEnabled,
    interval,
    ...useDealScoreLogTimelineQuery(filters, interval, !loyaltyEnabled),
  };
};
