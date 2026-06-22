import React from 'react';
import { useQuery } from '@apollo/client';
import { Card } from 'erxes-ui';
import { DASHBOARD_SUMMARY } from '../graphql/queries/queries';

interface KpiData {
  current: number;
  previous: number;
  percentChange: number;
}

interface Props {
  filters: { fromDate?: string; toDate?: string; dateRange?: string };
}

const KpiCard = ({ title, data }: { title: string; data: KpiData }) => (
  <Card>
    <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Card.Title className="text-sm font-medium">{title}</Card.Title>
    </Card.Header>
    <Card.Content>
      <div className="text-2xl font-bold">{data.current.toLocaleString()}</div>
      <p className="text-xs text-muted-foreground">
        {data.percentChange !== 0 && (
          <>
            {data.percentChange > 0 ? (
              <span className="text-green-500">▲</span>
            ) : (
              <span className="text-red-500">▼</span>
            )}
            {Math.abs(data.percentChange)}% from previous ({data.previous.toLocaleString()})
          </>
        )}
      </p>
    </Card.Content>
  </Card>
);

export const DashboardSummary: React.FC<Props> = ({ filters }) => {
  const { data, loading, error } = useQuery(DASHBOARD_SUMMARY, {
    variables: { filters },
  });

  if (loading) return <div className="text-center">Loading KPIs...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!data?.dashboardSummary) return null;

  const { totalDeals, wonDeals, lostDeals, conversionRate, expectedRevenue } =
    data.dashboardSummary;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <KpiCard title="Total Deals" data={totalDeals} />
      <KpiCard title="Won Deals" data={wonDeals} />
      <KpiCard title="Lost Deals" data={lostDeals} />
      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">Conversion Rate</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">{conversionRate.current.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            {conversionRate.percentChange !== 0 && (
              <>
                {conversionRate.percentChange > 0 ? (
                  <span className="text-green-500">▲</span>
                ) : (
                  <span className="text-red-500">▼</span>
                )}
                {Math.abs(conversionRate.percentChange)}% from previous ({conversionRate.previous.toFixed(1)}%)
              </>
            )}
          </p>
        </Card.Content>
      </Card>
      <KpiCard title="Expected Revenue" data={expectedRevenue} />
    </div>
  );
};