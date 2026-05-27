import {
  IconChartHistogram,
  IconTrendingUp,
  IconTrendingDown,
  IconCoins,
  IconCaretRightFilled,
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

type ScoreStats = {
  totalPointEarned?: number;
  totalPointBalance?: number;
  totalPointRedeemed?: number;
  redemptionRate?: number;
  activeLoyaltyMembers?: number;
  monthlyActiveUsers?: number;
  mostRedeemedProductCategory?: string;
};

const useScoreStats = (ownerId?: string, ownerType?: string) => {
  const { data, loading } = useQuery(SCORE_LOG_STATISTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { ownerId, ownerType },
  });
  return { stats: (data?.scoreLogStatistics || {}) as ScoreStats, loading };
};

const ScoreStatCards = ({
  stats,
  loading,
}: {
  stats: ScoreStats;
  loading: boolean;
}) => {
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
          label="Total Earned"
          value={Number(earned).toLocaleString()}
        />
        <StatCard
          icon={<IconCoins className="size-4 text-blue-500" />}
          label="Points Balance"
          value={Number(balance).toLocaleString()}
        />
        <StatCard
          icon={<IconTrendingDown className="size-4 text-red-400" />}
          label="Total Redeemed"
          value={Number(redeemed).toLocaleString()}
        />
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <SecondaryRow
          label="Redemption Rate"
          value={
            redemptionRate == null
              ? '—'
              : `${Number(redemptionRate).toFixed(1)}%`
          }
        />
        <SecondaryRow
          label="Active Loyalty Members"
          value={stats.activeLoyaltyMembers ?? '—'}
        />
        <SecondaryRow
          label="Monthly Active Users"
          value={stats.monthlyActiveUsers ?? '—'}
        />
        {stats.mostRedeemedProductCategory && (
          <SecondaryRow
            label="Top Redeemed Category"
            value={stats.mostRedeemedProductCategory}
          />
        )}
      </div>
    </div>
  );
};

const ScoreSummaryPanelContent = () => {
  const { stats, loading } = useScoreStats();

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
            Summary
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
  const [open, setOpen] = useState('');

  return (
    <SideMenu value={open} onValueChange={setOpen}>
      <SideMenu.Content value="score-summary" className="data-[state=active]:w-96">
        <SideMenu.Header Icon={IconChartHistogram} label="Score Summary" />
        {open === 'score-summary' && <ScoreSummaryPanelContent />}
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="score-summary"
          label="Score Summary"
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
  const { data, loading } = useQuery(SCORE_LOG_STATISTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { ownerId, ownerType },
    skip: !ownerId,
  });
  const stats = (data?.scoreLogStatistics || {}) as ScoreStats;

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background">
        <IconChartHistogram className="size-4 text-muted-foreground" />
        <span className="font-medium text-primary">Score Summary</span>
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
