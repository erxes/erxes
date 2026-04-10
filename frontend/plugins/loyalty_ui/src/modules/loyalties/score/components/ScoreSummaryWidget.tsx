import {
  IconCaretRightFilled,
  IconChartHistogram,
  IconCircleFilled,
} from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { Button, cn, Collapsible, SideMenu } from 'erxes-ui';
import { SCORE_LOG_STATISTICS_QUERY } from '../graphql/queries';

const COLORS = [
  'text-blue-600',
  'text-green-500',
  'text-purple-500',
  'text-red-500',
  'text-yellow-500',
  'text-orange-500',
  'text-pink-500',
];

export const ScoreSummaryWidget = () => {
  const { data, loading } = useQuery(SCORE_LOG_STATISTICS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  const stats = data?.scoreLogStatistics || {};

  const SUMMARY_ITEMS = [
    {
      key: 'totalPointEarned',
      label: 'Total Point Earned',
      value: stats.totalPointEarned ?? '-',
    },
    {
      key: 'totalPointBalance',
      label: 'Points Balance',
      value: stats.totalPointBalance ?? '-',
    },
    {
      key: 'mostRedeemedProductCategory',
      label: 'Top Redeemed Product Catalog',
      value: stats.mostRedeemedProductCategory ?? '-',
    },
    {
      key: 'redemptionRate',
      label: 'Redemption Rates',
      value:
        stats.redemptionRate != null
          ? `${Number(stats.redemptionRate).toFixed(1)}%`
          : '-',
    },
    {
      key: 'activeLoyaltyMembers',
      label: 'Active Loyalty Members',
      value: stats.activeLoyaltyMembers ?? '-',
    },
    {
      key: 'monthlyActiveUsers',
      label: 'Monthly Active Users',
      value: stats.monthlyActiveUsers ?? '-',
    },
    {
      key: 'totalPointRedeemed',
      label: 'Total Point Redeemed',
      value: stats.totalPointRedeemed ?? '-',
    },
  ];

  return (
    <SideMenu defaultValue="">
      <SideMenu.Content value="score-summary">
        <SideMenu.Header Icon={IconChartHistogram} label="Score Summary" />
        <div className="p-4 border-b">
          <Collapsible className="group/collapsible-menu" defaultOpen>
            <Collapsible.Trigger asChild>
              <Button
                variant="secondary"
                className="w-min text-accent-foreground justify-start text-left"
                size="sm"
              >
                <IconCaretRightFilled className="transition-transform group-data-[state=open]/collapsible-menu:rotate-90" />
                Summary
              </Button>
            </Collapsible.Trigger>
            <Collapsible.Content>
              <div className="flex flex-col gap-4 items-start w-full my-4">
                {SUMMARY_ITEMS.map(({ key, label, value }, index) => (
                  <div key={key} className="flex items-center gap-1">
                    <div className="flex items-center gap-2">
                      <IconCircleFilled
                        className={cn('size-2', COLORS[index % COLORS.length])}
                      />
                      <p className="text-xs font-medium text-muted-foreground">
                        {label}:
                      </p>
                    </div>
                    <p className="text-xs font-medium">
                      {loading ? '...' : value}
                    </p>
                  </div>
                ))}
              </div>
            </Collapsible.Content>
          </Collapsible>
        </div>
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
