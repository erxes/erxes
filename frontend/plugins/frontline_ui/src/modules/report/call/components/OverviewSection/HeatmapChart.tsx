import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconDownload } from '@tabler/icons-react';
import { Button, ToggleGroup, toast } from 'erxes-ui';
import { DOW_LABELS, fmtPct } from '../../utils';
import { downloadHeatmapExcel } from '../../heatmapExcel';
import { useCallFilters } from '../../hooks/useCallFilters';
import { useHeatmapExport } from '../../hooks/useHeatmapExport';
import type { HeatCell, HeatMetric } from '../../types';

interface HeatmapChartProps {
  cells: HeatCell[];
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DOWS = [1, 2, 3, 4, 5, 6, 7];

const METRIC_HUE: Record<HeatMetric, string> = {
  total: 'var(--heatmap-hue)',
  answered: '150',
  noAnswer: '25',
};

export const HeatmapChart = memo(function HeatmapChart({
  cells,
}: HeatmapChartProps) {
  const { t } = useTranslation('frontline');
  const [metric, setMetric] = useState<HeatMetric>('total');
  const [exporting, setExporting] = useState(false);
  const { startDate, endDate, dateRangeLabel } = useCallFilters();
  const { loadForExport, loading: exportLoading } = useHeatmapExport();

  const metricLabel: Record<HeatMetric, string> = {
    total: t('total-calls'),
    answered: t('answered'),
    noAnswer: t('no-answer'),
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const daily = await loadForExport();

      if (!daily.length) {
        toast({
          title: t('call-history-export-empty', {
            defaultValue: 'Nothing to export',
          }),
          variant: 'destructive',
        });
        return;
      }

      await downloadHeatmapExcel({
        cells: daily,
        startDate,
        endDate,
        metric,
        title: `${metricLabel[metric]} · ${dateRangeLabel}`,
        dateHeader: t('date'),
        totalHeader: t('total'),
        sheetName: metricLabel[metric].slice(0, 31),
        fileName: `call-heatmap-${metric}-${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
      });

      toast({
        title: t('call-history-export-done', {
          defaultValue: 'Export downloaded',
        }),
      });
    } catch (error) {
      toast({
        title: t('something-went-wrong'),
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const { maxValue, cellMap } = useMemo(() => {
    const map = new Map<string, HeatCell>();
    let max = 0;
    for (const cell of cells) {
      map.set(`${cell.dow}:${cell.hour}`, cell);
      if (cell[metric] > max) max = cell[metric];
    }
    return { maxValue: Math.max(max, 1), cellMap: map };
  }, [cells, metric]);

  if (!cells.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {t('no-heatmap-data')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-end gap-2">
        <ToggleGroup
          variant="outline"
          size="sm"
          type="single"
          value={metric}
          onValueChange={(value) => value && setMetric(value as HeatMetric)}
        >
          <ToggleGroup.Item value="total" aria-label={t('total-calls')}>
            {t('total-calls')}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="answered" aria-label={t('answered')}>
            {t('answered')}
          </ToggleGroup.Item>
          <ToggleGroup.Item value="noAnswer" aria-label={t('no-answer')}>
            {t('no-answer')}
          </ToggleGroup.Item>
        </ToggleGroup>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || exportLoading}
        >
          <IconDownload />
          {t('export-excel')}
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 640 }}>
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

          {DOWS.map((dow) => (
            <div key={dow} className="flex items-center">
              <div className="w-10 shrink-0 text-[10px] text-muted-foreground text-right pr-1.5">
                {DOW_LABELS[dow]}
              </div>
              {HOURS.map((hour) => {
                const cell = cellMap.get(`${dow}:${hour}`);
                const intensity = cell ? cell[metric] / maxValue : 0;
                return (
                  <div
                    key={hour}
                    title={
                      cell
                        ? `${DOW_LABELS[dow]} ${hour}:00 — ${cell.total} ${t(
                            'calls',
                          )}, ${cell.answered} ${t('answered')}, ${
                            cell.noAnswer
                          } ${t('no-answer')} (${fmtPct(cell.answerRate)})`
                        : t('no-data')
                    }
                    className="flex-1 m-[1px] rounded-sm aspect-square"
                    style={{
                      background:
                        intensity > 0
                          ? `oklch(${0.55 + 0.3 * (1 - intensity)} ${
                              0.18 * intensity
                            } ${METRIC_HUE[metric]})`
                          : 'var(--muted)',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});
