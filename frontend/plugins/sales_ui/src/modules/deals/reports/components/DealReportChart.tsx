import React from 'react';
import { useQuery } from '@apollo/client';
import { DEAL_REPORT } from '../graphql/queries/queries';
import { Card } from 'erxes-ui';
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

export const DealReportChart: React.FC<Props> = ({ chartType, filters, title }) => {
  const { data, loading, error } = useQuery(DEAL_REPORT, {
    variables: { chartType, filters },
  });

  if (loading) return <div className="text-center py-4">Loading chart...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!data?.dealReports) return <div className="text-gray-500">No data</div>;

  const { labels, datasets } = data.dealReports;

  // Transform data for Recharts
  const chartData = labels.map((label: string, idx: number) => {
    const entry: any = { name: label };
    datasets.forEach((ds: any) => {
      const key = ds.label || 'value';
      entry[key] = ds.data[idx] ?? 0;
    });
    return entry;
  });

  if (chartData.length === 0) {
    return (
      <Card>
        <Card.Header>
          <Card.Title>{title || chartType}</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="text-gray-500">No data to display</div>
        </Card.Content>
      </Card>
    );
  }

  const isSingle = datasets.length === 1;
  const dataKeys = isSingle
    ? [datasets[0]?.label || 'value']
    : datasets.map((ds: any) => ds.label || `Data ${ds.index + 1}`);

  return (
    <Card>
      <Card.Header>
        <Card.Title>{title || chartType}</Card.Title>
      </Card.Header>
      <Card.Content>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {isSingle ? (
              <Bar dataKey={dataKeys[0]} fill={COLORS[0]} />
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
      </Card.Content>
    </Card>
  );
};