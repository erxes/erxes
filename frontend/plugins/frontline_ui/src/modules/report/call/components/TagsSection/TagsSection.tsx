import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartExportButton } from '@/report/components/chart-export/ChartExportButton';
import type { ChartExportColumn } from '@/report/components/chart-export/ChartExportButton';
import { Button, Combobox, Command, Filter, Popover } from 'erxes-ui';
import { useDashboard } from '../../hooks/useDashboard';
import {
  SelectChartProvider,
  SelectChartType,
} from '@/report/components/select-chart-type/SelectChartType';
import {
  ChartPagination,
  useChartPagination,
} from '@/report/components/chart-pagination/ChartPagination';
import { ResponsesChartType } from '@/report/types';
import { useTagStats } from '../../hooks/useTagStats';
import type { TagStat } from '../../types';
import { fmtDur, fmtNum, fmtPct } from '../../utils';
import { Meter, rateColorVar } from '../Meter';
import { ReportTable } from '../ReportTable';
import { SectionCard } from '../SectionCard';
import {
  TagBarChart,
  TagLineChart,
  TagPieChart,
  TagRadarChart,
} from './TagCharts';

const TAGS_PER_PAGE = 10;

export function TagsSection() {
  const { t } = useTranslation('frontline');
  const [agentExtension, setAgentExtension] = useState('all');
  const { tags, loading, error } = useTagStats(agentExtension);
  // The agent picker reuses the extensions the dashboard already loaded, so
  // selecting one never costs an extra round trip.
  const { agentStats } = useDashboard();
  // The call page has no per-card id, so the choice lives for this mount only.
  // The table is the only view that carries every metric, so it opens first.
  const [chartType, setChartType] = useState<ResponsesChartType>(
    ResponsesChartType.Table,
  );
  const [chartTypeOpen, setChartTypeOpen] = useState(false);

  const {
    pagedData: pagedTags,
    page,
    totalPages,
    totalCount,
    handlePrev,
    handleNext,
  } = useChartPagination(tags, TAGS_PER_PAGE);

  // The bar scales against the whole range, so a row keeps its length when the
  // page it sits on changes.
  const busiest = Math.max(...tags.map(({ totalCalls }) => totalCalls), 1);

  const exportColumns = useMemo<ChartExportColumn<TagStat>[]>(
    () => [
      { key: 'name', header: t('tag', 'Tag') },
      { key: 'totalCalls', header: t('total') },
      {
        key: 'share',
        header: t('share', 'Share'),
        format: (value: number) => `${value}%`,
      },
      { key: 'answeredCalls', header: t('answered') },
      { key: 'missedCalls', header: t('missed') },
      {
        key: 'answeredRate',
        header: t('answered-rate', 'Answered rate'),
        format: (value: number) => `${value}%`,
      },
      { key: 'averageWaitTime', header: t('avg-wait', 'Avg wait') },
      { key: 'averageTalkTime', header: t('avg-talk', 'Avg talk') },
    ],
    [t],
  );

  return (
    <SectionCard
      actions={
        <div className="flex items-center gap-1">
          <Filter id="call-tags-filter" sessionKey="call-tags-filter">
            <Filter.Popover scope="call-tags-filter">
              <Filter.Trigger isFiltered={agentExtension !== 'all'} />
              <Combobox.Content>
                <Filter.View>
                  <Command>
                    <Command.List>
                      <Filter.Item value="agent">
                        {t('agent', 'Agent')}
                      </Filter.Item>
                      {agentExtension !== 'all' && (
                        <>
                          <Command.Separator />
                          <Command.Item
                            value="clear"
                            onSelect={() => setAgentExtension('all')}
                            className="text-destructive"
                          >
                            {t('clear-all')}
                          </Command.Item>
                        </>
                      )}
                    </Command.List>
                  </Command>
                </Filter.View>
                <Filter.View filterKey="agent">
                  <Command>
                    <Command.Input placeholder={t('agent', 'Agent')} />
                    <Command.List>
                      <Command.Item
                        value="all"
                        onSelect={() => setAgentExtension('all')}
                      >
                        {t('all-agents', 'All agents')}
                        <Combobox.Check checked={agentExtension === 'all'} />
                      </Command.Item>
                      {agentStats.map(({ agent, agentName }) => (
                        <Command.Item
                          key={agent}
                          value={agentName ? `${agentName} ${agent}` : agent}
                          onSelect={() => setAgentExtension(agent)}
                        >
                          {agentName ? `${agentName} · ${agent}` : agent}
                          <Combobox.Check checked={agentExtension === agent} />
                        </Command.Item>
                      ))}
                    </Command.List>
                  </Command>
                </Filter.View>
              </Combobox.Content>
            </Filter.Popover>
          </Filter>

          {/* The shared trigger is a wide pill; this one squares up with the
              export button sitting next to it. */}
          <SelectChartProvider
            value={chartType}
            onValueChange={setChartType}
            setOpen={setChartTypeOpen}
          >
            <Popover open={chartTypeOpen} onOpenChange={setChartTypeOpen}>
              <Popover.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  title={t('select-chart')}
                >
                  <SelectChartType.Value placeholder="" />
                </Button>
              </Popover.Trigger>
              <Combobox.Content sideOffset={8}>
                <SelectChartType.Content />
              </Combobox.Content>
            </Popover>
          </SelectChartProvider>
          <ChartExportButton
            data={tags}
            columns={exportColumns}
            filename="call-tags"
          />
        </div>
      }
      title={t('call-tags', 'Call Tags')}
      description={t(
        'calls-by-tag-description',
        'Tags carried by the conversation each call opened',
      )}
      accentClass="bg-[var(--chart-3)]"
      loading={loading}
      error={error}
      skeletonHeight="h-48"
    >
      {!tags.length ? (
        <ReportTable.Empty>
          {t('no-tag-data', 'No tagged calls in this range')}
        </ReportTable.Empty>
      ) : chartType === ResponsesChartType.Bar ? (
        <TagBarChart tags={pagedTags} />
      ) : chartType === ResponsesChartType.Line ? (
        <TagLineChart tags={pagedTags} />
      ) : chartType === ResponsesChartType.Pie ? (
        <TagPieChart tags={pagedTags} />
      ) : chartType === ResponsesChartType.Radar ? (
        <TagRadarChart tags={pagedTags} />
      ) : (
        <ReportTable>
          <ReportTable.Header>
            <ReportTable.HeaderRow>
              <ReportTable.Head align="center" className="w-14 px-2">
                #
              </ReportTable.Head>
              <ReportTable.Head>{t('tag', 'Tag')}</ReportTable.Head>
              <ReportTable.Head align="right" className="w-36">
                {t('total')}
              </ReportTable.Head>
              <ReportTable.Head align="right">{t('share')}</ReportTable.Head>
              <ReportTable.Head align="right">{t('answered')}</ReportTable.Head>
              <ReportTable.Head align="right">{t('missed')}</ReportTable.Head>
              <ReportTable.Head align="right" className="w-32">
                {t('answered-rate', 'Answered rate')}
              </ReportTable.Head>
              <ReportTable.Head align="right">
                {t('avg-wait', 'Avg Wait')}
              </ReportTable.Head>
              <ReportTable.Head align="right">
                {t('avg-talk', 'Avg Talk')}
              </ReportTable.Head>
            </ReportTable.HeaderRow>
          </ReportTable.Header>
          <ReportTable.Body>
            {pagedTags.map((tag, i) => (
              <ReportTable.Row key={tag.tagId} index={i}>
                <ReportTable.Cell align="center" className="w-14 px-2">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground">
                    {(page - 1) * TAGS_PER_PAGE + i + 1}
                  </span>
                </ReportTable.Cell>

                <ReportTable.Cell>
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        background: tag.colorCode ?? 'var(--muted-foreground)',
                      }}
                    />
                    <span className="text-sm font-medium">
                      {/* A tag deleted after it was applied keeps its calls. */}
                      {tag.name ?? t('deleted-tag', 'Deleted tag')}
                    </span>
                  </div>
                </ReportTable.Cell>

                <ReportTable.Cell align="right" numeric className="w-36">
                  <p className="text-sm font-semibold">
                    {fmtNum(tag.totalCalls)}
                  </p>
                  <Meter
                    className="mt-1.5"
                    value={(tag.totalCalls / busiest) * 100}
                    colorVar="var(--chart-3)"
                  />
                </ReportTable.Cell>

                <ReportTable.Cell
                  align="right"
                  numeric
                  className="font-mono text-sm"
                >
                  {fmtPct(tag.share)}
                </ReportTable.Cell>

                <ReportTable.Cell align="right">
                  <ReportTable.Badge tone="success">
                    {fmtNum(tag.answeredCalls)}
                  </ReportTable.Badge>
                </ReportTable.Cell>

                <ReportTable.Cell align="right">
                  <ReportTable.Badge tone="destructive">
                    {fmtNum(tag.missedCalls)}
                  </ReportTable.Badge>
                </ReportTable.Cell>

                <ReportTable.Cell align="right" numeric className="w-32">
                  <p className="text-sm font-semibold">
                    {fmtPct(tag.answeredRate)}
                  </p>
                  <Meter
                    className="mt-1.5"
                    value={tag.answeredRate}
                    colorVar={rateColorVar(tag.answeredRate)}
                  />
                </ReportTable.Cell>

                <ReportTable.Cell
                  align="right"
                  numeric
                  className="font-mono text-sm"
                >
                  {fmtDur(tag.averageWaitTime)}
                </ReportTable.Cell>

                <ReportTable.Cell
                  align="right"
                  numeric
                  className="font-mono text-sm"
                >
                  {fmtDur(tag.averageTalkTime)}
                </ReportTable.Cell>
              </ReportTable.Row>
            ))}
          </ReportTable.Body>
        </ReportTable>
      )}

      <ChartPagination
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </SectionCard>
  );
}
