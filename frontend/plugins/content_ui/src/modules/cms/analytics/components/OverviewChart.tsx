import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { OverviewPoint } from '../types';

interface OverviewChartProps {
  data: OverviewPoint[];
  loading?: boolean;
}

export function OverviewChart({ data, loading }: OverviewChartProps) {
  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded-lg" />;
  }

  if (!data.length) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-muted-foreground border rounded-lg">
        No data for selected period
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="text-sm font-medium mb-4">Sessions & Pageviews</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => v.slice(5)}
          />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            labelFormatter={(v) => `Date: ${v}`}
            formatter={(value: number, name: string) => [
              value.toLocaleString(),
              name.charAt(0).toUpperCase() + name.slice(1),
            ]}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="sessions"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="pageviews"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="users"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
