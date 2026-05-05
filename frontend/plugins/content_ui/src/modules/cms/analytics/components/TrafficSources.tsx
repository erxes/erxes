import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TrafficSource } from '../types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface TrafficSourcesProps {
  data: TrafficSource[];
  loading?: boolean;
}

export function TrafficSources({ data, loading }: TrafficSourcesProps) {
  const total = data.reduce((sum, s) => sum + s.sessions, 0);

  return (
    <div className="border rounded-lg p-4 bg-card space-y-3">
      <h3 className="text-sm font-medium">Traffic Sources</h3>
      {loading ? (
        <div className="h-40 bg-muted animate-pulse rounded" />
      ) : data.length === 0 ? (
        <p className="text-sm text-muted-foreground">No source data available</p>
      ) : (
        <div className="flex gap-4 items-center">
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={data}
                dataKey="sessions"
                nameKey="source"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => [v.toLocaleString(), 'Sessions']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-1.5">
            {data.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-none"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-muted-foreground truncate max-w-[120px]">
                    {s.source}
                  </span>
                </div>
                <span className="font-medium tabular-nums">
                  {total > 0 ? `${Math.round((s.sessions / total) * 100)}%` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
