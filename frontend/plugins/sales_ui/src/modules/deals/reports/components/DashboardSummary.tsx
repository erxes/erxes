import React from 'react';
import { useQuery } from '@apollo/client';
import { SectionCard } from '../components/common/SectionCard';
import { DASHBOARD_SUMMARY } from '../graphql/queries/queries';

interface KpiData {
  current: number;
  previous: number;
  percentChange: number;
}

interface Props {
  filters: { fromDate?: string; toDate?: string; dateRange?: string };
}

const KpiCard = ({
  title,
  data,
  suffix = '',
}: {
  title: string;
  data: KpiData;
  suffix?: string;
}) => (
  <SectionCard title={title}>
    <div className="text-2xl font-bold">
      {data.current.toLocaleString()}
      {suffix}
    </div>

    {data.percentChange !== 0 && (
      <p className="text-xs text-muted-foreground">
        {data.percentChange > 0 ? (
          <span className="text-green-500">▲</span>
        ) : (
          <span className="text-red-500">▼</span>
        )}

        {Math.abs(data.percentChange)}% from previous (
        {data.previous.toLocaleString()}
        {suffix})
      </p>
    )}
  </SectionCard>
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
      <KpiCard
  title="Conversion Rate"
  data={conversionRate}
  suffix="%"
/>
      <KpiCard title="Expected Revenue" data={expectedRevenue} />
    </div>
  );
};