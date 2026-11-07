import { cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard, TDashboardWidgetConfig } from 'ui-modules';
import { SafeRelativeDate } from '@/loyalties/components/SafeRelativeDate';
import { getOwnerName } from '@/loyalties/scores/components/ScoreColumns';
import { LoyaltyDashboardBody } from '../components/LoyaltyDashboardBody';
import { LoyaltyDashboardViewAll } from '../components/LoyaltyDashboardViewAll';
import {
  recentScoreLogsConfigSchema,
  TRecentScoreLogsConfig,
} from '../dashboardWidgetConfig';
import { useLoyaltyDashboardConfig } from '../hooks/useLoyaltyDashboardConfig';
import { useRecentScoreLogs } from '../hooks/useLoyaltyDashboardData';
import { useScoreCampaignTitle } from '../hooks/useScoreCampaignTitle';

const NO_CAMPAIGN: TRecentScoreLogsConfig = {};

/** The latest point movements: who, how many, from which campaign, when. */
export const RecentScoreLogsDashboardWidget = ({
  config,
}: {
  config?: TDashboardWidgetConfig | null;
}) => {
  const { t } = useTranslation('loyalty');
  const { campaignId } = useLoyaltyDashboardConfig(
    recentScoreLogsConfigSchema,
    config,
    NO_CAMPAIGN,
  );
  const { logs, loading, error, refetch } = useRecentScoreLogs(campaignId);
  const campaignTitle = useScoreCampaignTitle(campaignId);

  return (
    <DashboardWidgetCard
      title={[t('dashboard.recent-score-logs'), campaignTitle]
        .filter(Boolean)
        .join(' · ')}
      action={<LoyaltyDashboardViewAll to="/loyalty/scores" />}
    >
      <LoyaltyDashboardBody
        loading={loading}
        error={error}
        onRetry={refetch}
        isEmpty={!logs.length}
        emptyLabel={t('dashboard.no-score-logs')}
      >
        <ul className="flex flex-col gap-0.5">
          {logs.map((log) => {
            const change = Number(log.change) || 0;

            return (
              <li
                key={log._id}
                className="flex h-10 min-w-0 items-center gap-3 rounded-md px-2 text-sm hover:bg-accent/60"
              >
                <span className="min-w-0 flex-1 truncate">
                  {getOwnerName(log.owner, log.ownerType) || '—'}
                </span>
                <span className="hidden max-w-40 truncate text-xs text-muted-foreground lg:inline">
                  {log.campaign?.title || log.description}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-semibold tabular-nums',
                    change > 0 && 'text-success',
                    change < 0 && 'text-destructive',
                  )}
                >
                  {change > 0 ? '+' : ''}
                  {change.toLocaleString()}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  <SafeRelativeDate value={log.createdAt} />
                </span>
              </li>
            );
          })}
        </ul>
      </LoyaltyDashboardBody>
    </DashboardWidgetCard>
  );
};
