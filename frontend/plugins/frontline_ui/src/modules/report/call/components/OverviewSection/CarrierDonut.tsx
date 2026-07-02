import { memo, useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';
import { CARRIER_CSS_VARS, CARRIER_COLOR_VAR, fmtPct } from '../../utils';
import type { CarrierSlice } from '../../types';

interface CarrierDonutProps {
  data: CarrierSlice[];
}

/** Donut chart showing call distribution by Mongolian carrier. */
export const CarrierDonut = memo(function CarrierDonut({
  data,
}: CarrierDonutProps) {
  const { t } = useTranslation('frontline');
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  if (!data.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {t('no-carrier-data')}
      </div>
    );
  }

  const getColor = (name: string, index: number): string =>
    CARRIER_COLOR_VAR[name] ??
    CARRIER_CSS_VARS[index % CARRIER_CSS_VARS.length];

  return (
    <div className="flex items-center gap-4">
      {/* Donut */}
      <ResponsiveContainer width={160} height={160}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={70}
            innerRadius={44}
            strokeWidth={0}
          >
            {data.map((slice, i) => (
              <Cell key={slice.name} fill={getColor(slice.name, i)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <ul className="flex flex-col gap-1.5 min-w-0 flex-1">
        {data.map((slice, i) => (
          <li key={slice.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: getColor(slice.name, i) }}
            />
            <span className="flex-1 truncate text-muted-foreground">
              {slice.name}
            </span>
            <span className="font-semibold tabular-nums">
              {fmtPct((slice.value / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
});
