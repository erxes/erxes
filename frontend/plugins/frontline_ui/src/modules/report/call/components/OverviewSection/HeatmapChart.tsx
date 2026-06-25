import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DOW_LABELS, fmtPct } from '../../utils';
import type { HeatCell } from '../../types';

interface HeatmapChartProps {
  cells: HeatCell[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DOWS = [1, 2, 3, 4, 5, 6, 7]; // Mon–Sun ($isoDayOfWeek)

/**
 * 24 × 7 call-volume heatmap.
 * Intensity is rendered via oklch using the `--heatmap-hue` CSS variable
 * so it adapts to the active theme without hardcoding colours.
 */
export const HeatmapChart = memo(function HeatmapChart({
  cells,
}: HeatmapChartProps) {
  const { t } = useTranslation('frontline');
  const { maxTotal, cellMap } = useMemo(() => {
    const map = new Map<string, HeatCell>();
    let max = 0;
    for (const cell of cells) {
      map.set(`${cell.dow}:${cell.hour}`, cell);
      if (cell.total > max) max = cell.total;
    }
    return { maxTotal: Math.max(max, 1), cellMap: map };
  }, [cells]);

  if (!cells.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t('no-heatmap-data')}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: 640 }}>
        {/* Hour header */}
        <div className="flex">
          <div className="w-10 shrink-0" />
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex-1 text-center text-[9px] text-muted-foreground"
            >
              {h % 3 === 0 ? `${String(h).padStart(2, '0')}h` : ''}
            </div>
          ))}
        </div>

        {/* Rows */}
        {DOWS.map((dow) => (
          <div key={dow} className="flex items-center">
            <div className="w-10 shrink-0 text-[10px] text-muted-foreground text-right pr-1.5">
              {DOW_LABELS[dow]}
            </div>
            {HOURS.map((hour) => {
              const cell = cellMap.get(`${dow}:${hour}`);
              const intensity = cell ? cell.total / maxTotal : 0;
              return (
                <div
                  key={hour}
                  title={
                    cell
                      ? `${DOW_LABELS[dow]} ${hour}:00 — ${cell.total} calls, ${fmtPct(cell.answerRate)} answered`
                      : t('no-data')
                  }
                  className="flex-1 m-[1px] rounded-sm aspect-square"
                  style={{
                    background:
                      intensity > 0
                        ? `oklch(${0.55 + 0.3 * (1 - intensity)} ${0.18 * intensity} var(--heatmap-hue))`
                        : 'var(--muted)',
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});
