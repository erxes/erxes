import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard, TDashboardWidgetConfig } from 'ui-modules';
import { ScoreStatCards } from '@/loyalties/scores/components/ScoreSummaryWidget';
import { LoyaltyDashboardBody } from '../components/LoyaltyDashboardBody';
import { LoyaltyDashboardViewAll } from '../components/LoyaltyDashboardViewAll';
import {
  SCORE_SUMMARY_DEFAULTS,
  scoreSummaryConfigSchema,
} from '../dashboardWidgetConfig';
import { useLoyaltyDashboardConfig } from '../hooks/useLoyaltyDashboardConfig';
import { useScoreSummaryData } from '../hooks/useLoyaltyDashboardData';
import { usePeriodLabel } from '../hooks/usePeriodLabel';
import { useScoreCampaignTitle } from '../hooks/useScoreCampaignTitle';

/** Points earned, held and redeemed, for one campaign or all of them. */
export const ScoreSummaryDashboardWidget = ({
  config,
}: {
  config?: TDashboardWidgetConfig | null;
}) => {
  const { t } = useTranslation('loyalty');
  const { campaignId, days } = useLoyaltyDashboardConfig(
    scoreSummaryConfigSchema,
    config,
    SCORE_SUMMARY_DEFAULTS,
  );
  const { stats, loading, error, refetch } = useScoreSummaryData(
    campaignId,
    days,
  );
  const periodLabel = usePeriodLabel(days);
  const campaignTitle = useScoreCampaignTitle(campaignId);

  return (
    <DashboardWidgetCard
      title={[t('score-summary'), campaignTitle, periodLabel]
        .filter(Boolean)
        .join(' · ')}
      action={<LoyaltyDashboardViewAll to="/loyalty/scores" />}
    >
      <LoyaltyDashboardBody
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={false}
        emptyLabel=""
      >
        <div className="p-2">
          <ScoreStatCards stats={stats} loading={false} />
        </div>
      </LoyaltyDashboardBody>
    </DashboardWidgetCard>
  );
};
