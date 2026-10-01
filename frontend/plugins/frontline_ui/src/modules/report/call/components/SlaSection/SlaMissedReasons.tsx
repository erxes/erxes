import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltipContent } from 'erxes-ui';
import { Meter } from '../Meter';
import { ReportTable } from '../ReportTable';
import { fmtNum, fmtPct } from '../../utils';
import type {
  MissedHourCell,
  MissedReason,
  MissedReasonCount,
} from '../../types';
import { MISSED_REASON_META, MISSED_REASON_ORDER } from './slaUtils';

interface SlaMissedReasonsProps {
  reasons: MissedReasonCount[];
  byHour: MissedHourCell[];
  shortAbandonSeconds: number;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export const SlaMissedReasons = memo(function SlaMissedReasons({
  reasons,
  byHour,
  shortAbandonSeconds,
}: SlaMissedReasonsProps) {
  const { t } = useTranslation('frontline');

  const labelOf = (reason: MissedReason): string =>
    t(MISSED_REASON_META[reason].key, {
      defaultValue: MISSED_REASON_META[reason].label,
      seconds: shortAbandonSeconds,
    });

  const sorted = useMemo(
    () =>
      [...reasons].sort(
        (a, b) =>
          b.count - a.count ||
          MISSED_REASON_ORDER.indexOf(a.reason) -
            MISSED_REASON_ORDER.indexOf(b.reason),
      ),
    [reasons],
  );

  const total = sorted.reduce((sum, { count }) => sum + count, 0);
  const largest = sorted[0]?.count ?? 0;

  const present = useMemo(
    () =>
      MISSED_REASON_ORDER.filter((reason) =>
        byHour.some((cell) => cell.reason === reason),
      ),
    [byHour],
  );

  const hourly = useMemo(() => {
    if (!byHour.length) return [];
    const hours = byHour.map(({ hour }) => hour);
    const first = Math.min(...hours);
    const rows: Record<string, number | string>[] = [];
    for (let hour = first; hour <= Math.max(...hours); hour++) {
      const row: Record<string, number | string> = { hour: `${pad(hour)}:00` };
      for (const reason of present) row[reason] = 0;
      rows.push(row);
    }
    for (const cell of byHour) {
      rows[cell.hour - first][cell.reason] = cell.count;
    }
    return rows;
  }, [byHour, present]);

  const chartConfig = Object.fromEntries(
    present.map((reason) => [
      reason,
      { label: labelOf(reason), color: MISSED_REASON_META[reason].color },
    ]),
  );

  if (!total) {
    return (
      <ReportTable.Empty>
        {t('missed-reasons-empty', 'No missed inbound calls in this range')}
      </ReportTable.Empty>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <ul className="flex flex-col gap-3">
        {sorted.map((row) => {
          const meta = MISSED_REASON_META[row.reason];

          return (
            <li key={row.reason} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium">
                  {labelOf(row.reason)}
                </span>
                <span className="text-sm font-semibold tabular-nums">
                  {fmtNum(row.count)}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {fmtPct((row.count / total) * 100)}
                  </span>
                </span>
              </div>
              <Meter
                value={largest ? (row.count / largest) * 100 : 0}
                colorVar={meta.color}
                className="h-2"
              />
              <div className="flex justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  {t(`${meta.key}-hint`, { defaultValue: meta.hint })}
                </span>
                {row.calledBack > 0 && (
                  <span className="shrink-0 text-[var(--success)]">
                    {t('missed-reasons-called-back', {
                      defaultValue: '{{count}} called back',
                      count: row.calledBack,
                    })}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ChartContainer config={chartConfig} className="h-64 w-full">
        <BarChart
          data={hourly}
          margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            width={28}
            allowDecimals={false}
          />
          <Tooltip content={<ChartTooltipContent />} />
          {present.map((reason, index) => (
            <Bar
              key={reason}
              dataKey={reason}
              name={labelOf(reason)}
              stackId="missed"
              fill={MISSED_REASON_META[reason].color}
              maxBarSize={28}
              radius={index === present.length - 1 ? [3, 3, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  );
});
