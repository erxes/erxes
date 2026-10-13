import { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { CARRIER_CSS_VARS, CARRIER_COLOR_VAR, fmtPct } from '../../utils';
import type { CarrierSlice } from '../../types';

interface CarrierBarChartProps {
  data: CarrierSlice[];
}

export const CarrierBarChart = memo(function CarrierBarChart({
  data,
}: CarrierBarChartProps) {
  const { t } = useTranslation('frontline');
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {t('no-carrier-data', 'No carrier data')}
      </div>
    );
  }

  const getColor = (name: string, index: number): string =>
    CARRIER_COLOR_VAR[name] ??
    CARRIER_CSS_VARS[index % CARRIER_CSS_VARS.length];

  const chartData = data.map((slice) => ({
    ...slice,
    share: total ? (slice.value / total) * 100 : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
          width={72}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
          formatter={(value: number) => [
            `${value} (${fmtPct((value / total) * 100)})`,
            t('calls', 'Calls'),
          ]}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {chartData.map((slice, i) => (
            <Cell key={slice.name} fill={getColor(slice.name, i)} />
          ))}
          <LabelList
            dataKey="share"
            position="right"
            formatter={(share) => fmtPct(Number(share))}
            style={{ fontSize: 11, fontWeight: 600, fill: 'var(--foreground)' }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});
