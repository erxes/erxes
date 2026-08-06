import React from 'react';
import { useQuery } from '@apollo/client';
import { DEAL_REPORT } from '../graphql/queries/queries';
import { SectionCard } from '../components/common/SectionCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  chartType: string;
  filters: any;
  title?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c43', '#d45087', '#a4de6c'];

export const DealReportChart: React.FC<Props> = ({
  chartType,
  filters,
  title,
}) => {
  const { data, loading, error } = useQuery(DEAL_REPORT, {
    variables: { chartType, filters },
  });

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  const report = data?.dealReports;

  if (!loading && !report) {
    return (
      <SectionCard title={title || chartType}>
        <div className="text-gray-500">No data</div>
      </SectionCard>
    );
  }

  const labels = report?.labels ?? [];
  const datasets = report?.datasets ?? [];

  const chartData = labels.map((label: string, idx: number) => {
    const entry: any = { name: label };

    datasets.forEach((ds: any) => {
      entry[ds.label || 'value'] = ds.data[idx] ?? 0;
    });

    return entry;
  });

  const isSingle = datasets.length === 1;

  return (
    <SectionCard
      title={title || chartType}
      loading={loading}
      skeletonHeight="h-80"
    >
      {chartData.length === 0 ? (
        <div className="text-gray-500">No data to display</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />

            {isSingle ? (
              <Bar
                dataKey={datasets[0]?.label || 'value'}
                fill={COLORS[0]}
              />
            ) : (
              datasets.map((ds: any, idx: number) => (
                <Bar
                  key={idx}
                  dataKey={ds.label || `Data ${idx + 1}`}
                  fill={COLORS[idx % COLORS.length]}
                />
              ))
            )}
          </BarChart>
        </ResponsiveContainer>
      )}
    </SectionCard>
  );
};