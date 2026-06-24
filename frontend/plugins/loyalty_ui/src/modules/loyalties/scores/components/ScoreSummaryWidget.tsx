import { useTranslation } from 'react-i18next';
import {
  IconChartHistogram,
  IconTrendingUp,
  IconTrendingDown,
  IconCoins,
  IconCaretRightFilled,
  IconRefresh,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Button,
  Card,
  Collapsible,
  ScrollArea,
  Separator,
  SideMenu,
  Spinner,
} from 'erxes-ui';
import { SCORE_LOG_STATISTICS_QUERY } from '../graphql/queries';
import { ScoreStats, useScoreStatistics } from '../hooks/useScoreStatistics';
import { useRepairOwnerScore } from '../hooks/useRepairOwnerScore';

const ScoreStatCards = ({
  stats,
  loading,
}: {
  stats: ScoreStats;
  loading: boolean;
}) => {
  const { t } = useTranslation('loyalty');
  if (loading) return <Spinner containerClassName="py-10" />;

  const earned = stats.totalPointEarned ?? 0;
  const balance = stats.totalPointBalance ?? 0;
  const redeemed = stats.totalPointRedeemed ?? 0;
  const redemptionRate = stats.redemptionRate;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <StatCard
          icon={<IconTrendingUp className="size-4 text-green-500" />}
          label={t('total-point-earned')}
          value={Number(earned).toLocaleString()}
        />
        <StatCard
          icon={<IconCoins className="size-4 text-blue-500" />}
          label={t('points-balance')}
          value={Number(balance).toLocaleString()}
        />
        <StatCard
          icon={<IconTrendingDown className="size-4 text-red-400" />}
          label={t('total-point-redeemed')}
          value={Number(redeemed).toLocaleString()}
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <SecondaryRow
          label={t('redemption-rates')}
          value={
            redemptionRate == null
              ? '—'
              : `${Number(redemptionRate).toFixed(1)}%`
          }
        />
        <SecondaryRow
          label={t('active-loyalty-members')}
          value={stats.activeLoyaltyMembers ?? '—'}
        />
        <SecondaryRow
          label={t('monthly-active-users')}
          value={stats.monthlyActiveUsers ?? '—'}
        />
        {stats.mostRedeemedProductCategory && (
          <SecondaryRow
            label={t('top-redeemed-product-catalog')}
            value={stats.mostRedeemedProductCategory}
          />
        )}
      </div>
    </div>
  );
};

const ScoreSummaryPanelContent = () => {
  const { t } = useTranslation('loyalty');
  const { stats, loading } = useScoreStatistics();

  return (
    <div className="p-4">
      <Collapsible className="group/collapsible-menu" defaultOpen>
        <Collapsible.Trigger asChild>
          <Button
            variant="secondary"
            className="w-min text-accent-foreground justify-start text-left mb-3"
            size="sm"
          >
            <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90" />
            {t('summary')}
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <ScoreStatCards stats={stats} loading={loading} />
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
};

export const ScoreSummaryPanel = () => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState('');

  return (
    <SideMenu value={open} onValueChange={setOpen}>
      <SideMenu.Content value="score-summary" className="data-[state=active]:w-96">
        <SideMenu.Header Icon={IconChartHistogram} label={t('score-summary')} />
        {open === 'score-summary' && <ScoreSummaryPanelContent />}
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="score-summary"
          label={t('score-summary')}
          Icon={IconChartHistogram}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};

export const ScoreSummaryWidget = ({
  ownerId,
  ownerType,
}: {
  ownerId?: string;
  ownerType?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const { data, loading } = useQuery(SCORE_LOG_STATISTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { ownerId, ownerType },
    skip: !ownerId,
  });
  const stats = (data?.scoreLogStatistics || {}) as ScoreStats;

  const { repairOwnerScore, loading: repairing } = useRepairOwnerScore();

  const handleRepair = () => {
    if (!ownerId || !ownerType) return;
    repairOwnerScore({ ownerId, ownerType });
  };

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background">
        <IconChartHistogram className="size-4 text-muted-foreground" />
        <span className="font-medium text-primary">{t('score-summary')}</span>
        <Button
          variant="secondary"
          size="sm"
          className="ml-auto"
          onClick={handleRepair}
          disabled={!ownerId || !ownerType || repairing}
        >
          {repairing ? (
            <Spinner size="sm" />
          ) : (
            <IconRefresh className="size-4" />
          )}
          {t('repair')}
        </Button>
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="p-4">
          <ScoreStatCards stats={stats} loading={loading} />
        </div>
      </ScrollArea>
    </>
  );
};

const StatCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) => (
  <Card className="bg-background px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
    <span className="text-sm font-bold">{value}</span>
  </Card>
);

const SecondaryRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center justify-between px-1">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-semibold">{value}</span>
  </div>
);
