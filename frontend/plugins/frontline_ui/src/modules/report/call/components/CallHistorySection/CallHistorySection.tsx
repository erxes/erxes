import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import {
  IconDownload,
  IconPhoneIncoming,
  IconPhoneOutgoing,
  IconPlayerPlayFilled,
  IconSearch,
} from '@tabler/icons-react';
import {
  Button,
  Input,
  Select,
  Spinner,
  ToggleGroup,
  cn,
  toast,
} from 'erxes-ui';

import {
  CALL_HISTORY_PAGE_SIZE,
  useCallHistoryList,
} from '../../hooks/useCallHistoryList';
import { useCallHistoryExport } from '../../hooks/useCallHistoryExport';
import { useCallFilters } from '../../hooks/useCallFilters';
import { SectionCard } from '../SectionCard';
import { ReportTable } from '../ReportTable';
import { CARRIER_COLOR_VAR, fmtDur } from '../../utils';
import {
  CALL_HISTORY_EXPORT_LIMIT,
  downloadCallHistoryCsv,
} from '../../callHistoryCsv';
import type { CallHistoryEntry } from '../../types';
import { CallHistoryPager } from './CallHistoryPager';

const OUTCOME_TONE: Record<string, 'success' | 'destructive' | 'warning'> = {
  ANSWERED: 'success',
  IVR: 'warning',
  VOICEMAIL: 'warning',
  BUSY: 'destructive',
  'NO ANSWER': 'destructive',
  FAILED: 'destructive',
  MISSED: 'destructive',
};

const OUTCOME_LABEL: Record<string, string> = {
  ANSWERED: 'Answered',
  IVR: 'IVR only',
  VOICEMAIL: 'Voicemail',
  BUSY: 'Busy',
  'NO ANSWER': 'No answer',
  FAILED: 'Failed',
  MISSED: 'Missed',
};

const RESOLUTION_OPTIONS = [
  { value: 'all', label: 'Any state' },
  { value: 'unresolved', label: 'Unresolved' },
  { value: 'resolved', label: 'Resolved' },
];

const OUTCOME_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'ANSWERED', label: 'Answered' },
  { value: 'NO ANSWER', label: 'No answer' },
  { value: 'BUSY', label: 'Busy' },
  { value: 'FAILED', label: 'Failed' },
];

const pad = (value: number) => String(value).padStart(2, '0');

const formatWhen = (value: string | null) => {
  if (!value) return { time: '—', date: '' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { time: '—', date: '' };
  return {
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
      date.getSeconds(),
    )}`,
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate(),
    )}`,
  };
};

const initialOf = (entry: CallHistoryEntry) =>
  (entry.agentName || entry.agentExtension || '?').trim().charAt(0).toUpperCase();

export function CallHistorySection() {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const { queueId, dateRangeLabel } = useCallFilters();

  const [outcome, setOutcome] = useState('all');
  const [agentExtension, setAgentExtension] = useState('all');
  const [resolution, setResolution] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 400);
  const [exporting, setExporting] = useState(false);

  const { entries, totalCount, callerCount, agents, loading, initialLoading } =
    useCallHistoryList({
      outcome,
      agentExtension,
      resolution,
      searchValue: debouncedSearch,
      page,
    });

  const { loadForExport, loading: exportLoading } = useCallHistoryExport({
    outcome,
    agentExtension,
    resolution,
    searchValue: debouncedSearch,
  });

  const resetTo = (next: () => void) => {
    next();
    setPage(1);
  };

  const handleExport = async () => {
    if (totalCount > CALL_HISTORY_EXPORT_LIMIT) {
      toast({
        title: t('call-history-export-too-large', {
          defaultValue: 'Too many calls to export',
        }),
        description: t('call-history-export-narrow', {
          defaultValue:
            'This range holds {{count}} calls. Narrow the date range to {{limit}} or fewer.',
          count: totalCount,
          limit: CALL_HISTORY_EXPORT_LIMIT,
        }),
        variant: 'destructive',
      });
      return;
    }

    setExporting(true);
    try {
      const rows = await loadForExport();

      if (!rows.length) {
        toast({
          title: t('call-history-export-empty', {
            defaultValue: 'Nothing to export',
          }),
          variant: 'destructive',
        });
        return;
      }

      downloadCallHistoryCsv(
        rows,
        `call-history-${dateRangeLabel.replace(/[^\w-]+/g, '-')}.csv`,
      );
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

  return (
    <SectionCard
      title={t('call-history', { defaultValue: 'Call history' })}
      description={t('call-history-description', {
        defaultValue: 'Every call in the selected range — one row per call',
      })}
      accentClass="bg-[var(--chart-2)]"
      loading={initialLoading}
      skeletonHeight="h-64"
    >
      <div className="flex flex-wrap items-center gap-3 pb-4">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={outcome}
          onValueChange={(value) => value && resetTo(() => setOutcome(value))}
          className="inline-flex"
        >
          {OUTCOME_OPTIONS.map((option) => (
            <ToggleGroup.Item key={option.value} value={option.value}>
              {t(option.label.toLowerCase().replace(/\s+/g, '-'), {
                defaultValue: option.label,
              })}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>

        <Select
          value={agentExtension}
          onValueChange={(value) =>
            value && resetTo(() => setAgentExtension(value))
          }
        >
          <Select.Trigger className="h-8 w-44">
            <Select.Value
              placeholder={t('all-agents', { defaultValue: 'All agents' })}
            />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="all">
              {t('all-agents', { defaultValue: 'All agents' })}
            </Select.Item>
            {agents.map((agent) => (
              <Select.Item key={agent.extension} value={agent.extension}>
                {agent.name
                  ? `${agent.name} · ${agent.extension}`
                  : agent.extension}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <Select
          value={resolution}
          onValueChange={(value) =>
            value && resetTo(() => setResolution(value))
          }
        >
          <Select.Trigger className="h-8 w-36">
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            {RESOLUTION_OPTIONS.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {t(option.label.toLowerCase().replace(/\s+/g, '-'), {
                  defaultValue: option.label,
                })}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <div className="relative w-56">
          <IconSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) =>
              resetTo(() => setSearch(event.currentTarget.value))
            }
            placeholder={t('search-by-phone', {
              defaultValue: 'Search by phone…',
            })}
            className="h-8 pl-8"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          {loading && <Spinner size="sm" />}
          <Button
            size="sm"
            onClick={handleExport}
            disabled={exporting || exportLoading || !totalCount}
          >
            <IconDownload />
            {t('export-csv', { defaultValue: 'Export (CSV)' })}
          </Button>
        </div>
      </div>

      {!queueId ? (
        <ReportTable.Empty>
          {t('select-a-queue', { defaultValue: 'Select a queue to begin' })}
        </ReportTable.Empty>
      ) : !entries.length ? (
        <ReportTable.Empty>
          {t('no-call-history', {
            defaultValue: 'No calls match these filters',
          })}
        </ReportTable.Empty>
      ) : (
        <div
          className={cn(
            'transition-opacity',

            loading && 'pointer-events-none opacity-60',
          )}
        >
          <ReportTable>
            <ReportTable.Header>
              <ReportTable.HeaderRow>
                <ReportTable.Head align="center" className="w-12 px-2">
                  #
                </ReportTable.Head>
                <ReportTable.Head>
                  {t('date-time', { defaultValue: 'Date / time' })}
                </ReportTable.Head>
                <ReportTable.Head>
                  {t('caller', { defaultValue: 'Caller' })}
                </ReportTable.Head>
                <ReportTable.Head>
                  {t('direction', { defaultValue: 'Direction' })}
                </ReportTable.Head>
                <ReportTable.Head>
                  {t('outcome', { defaultValue: 'Outcome' })}
                </ReportTable.Head>
                <ReportTable.Head align="right">
                  {t('waited', { defaultValue: 'Waited' })}
                </ReportTable.Head>
                <ReportTable.Head align="right">
                  {t('talk', { defaultValue: 'Talk' })}
                </ReportTable.Head>
                <ReportTable.Head>
                  {t('agent', { defaultValue: 'Agent' })}
                </ReportTable.Head>
                <ReportTable.Head align="center" className="w-20">
                  {t('recording', { defaultValue: 'Recording' })}
                </ReportTable.Head>
              </ReportTable.HeaderRow>
            </ReportTable.Header>

            <ReportTable.Body>
              {entries.map((entry, index) => {
                const when = formatWhen(entry.startedAt);
                const carrierColor = CARRIER_COLOR_VAR[entry.carrier];
                const tone = OUTCOME_TONE[entry.outcome] ?? 'warning';
                const rowNumber =
                  (page - 1) * CALL_HISTORY_PAGE_SIZE + index + 1;

                return (
                  <ReportTable.Row
                    key={entry.uniqueid}
                    index={index}
                    className={cn(entry.conversationId && 'cursor-pointer')}
                    onClick={() =>
                      entry.conversationId &&
                      navigate(
                        `/frontline/inbox?conversationId=${entry.conversationId}`,
                      )
                    }
                  >
                    <ReportTable.Cell align="center" className="w-12 px-2">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {rowNumber}
                      </span>
                    </ReportTable.Cell>

                    <ReportTable.Cell numeric>
                      <p className="font-mono text-sm font-medium">
                        {when.time}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {when.date}
                      </p>
                    </ReportTable.Cell>

                    <ReportTable.Cell>
                      <div className="flex flex-col gap-0.5">
                        <span
                          className={cn(
                            'text-sm',
                            entry.customerName
                              ? 'font-medium'
                              : 'italic text-muted-foreground',
                          )}
                        >
                          {entry.customerName ??
                            t('unknown-caller', {
                              defaultValue: 'Not in contacts',
                            })}
                        </span>
                        <span className="flex flex-wrap items-center gap-1.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {entry.customerPhone || '—'}
                          </span>
                          <span
                            className="rounded px-1.5 py-px text-[10px] font-semibold text-primary-foreground"
                            style={{
                              background:
                                carrierColor ?? 'var(--muted-foreground)',
                            }}
                          >
                            {entry.carrier}
                          </span>
                          {entry.repeatCount > 1 && (
                            <span
                              className="rounded bg-warning/15 px-1.5 py-px text-[10px] font-semibold text-warning"
                              title={t('repeat-caller-hint', {
                                defaultValue:
                                  '{{count}} calls in this range, {{answered}} connected',
                                count: entry.repeatCount,
                                answered: entry.repeatAnswered,
                              })}
                            >
                              {t('repeat-calls', {
                                defaultValue: '{{count}}×',
                                count: entry.repeatCount,
                              })}
                            </span>
                          )}
                        </span>
                      </div>
                    </ReportTable.Cell>

                    <ReportTable.Cell>
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        {entry.direction === 'incoming' ? (
                          <IconPhoneIncoming className="h-4 w-4 text-success" />
                        ) : (
                          <IconPhoneOutgoing className="h-4 w-4 text-[var(--chart-5)]" />
                        )}
                        {entry.direction === 'incoming'
                          ? t('incoming', { defaultValue: 'Incoming' })
                          : t('outgoing', { defaultValue: 'Outgoing' })}
                      </span>
                    </ReportTable.Cell>

                    <ReportTable.Cell>
                      <ReportTable.Badge tone={tone}>
                        {OUTCOME_LABEL[entry.outcome] ?? entry.outcome}
                      </ReportTable.Badge>
                    </ReportTable.Cell>

                    <ReportTable.Cell
                      align="right"
                      numeric
                      className="font-mono text-sm"
                    >
                      {entry.waitTime === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        `${Math.round(entry.waitTime)}s`
                      )}
                    </ReportTable.Cell>

                    <ReportTable.Cell
                      align="right"
                      numeric
                      className="font-mono text-sm"
                    >
                      {entry.isAnswered ? (
                        fmtDur(entry.talkTime)
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </ReportTable.Cell>

                    <ReportTable.Cell>
                      {entry.agentExtension ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                            {initialOf(entry)}
                          </span>
                          <div className="leading-tight">
                            <p className="text-sm font-medium">
                              {entry.agentName ?? entry.agentExtension}
                            </p>
                            <p className="font-mono text-[11px] text-muted-foreground">
                              {entry.agentExtension}
                              {entry.rungCount > 1 &&
                                ` · ${t('rung-count', {
                                  defaultValue: '{{count}} rung',
                                  count: entry.rungCount,
                                })}`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {entry.rungCount
                            ? t('rung-count', {
                                defaultValue: '{{count}} rung',
                                count: entry.rungCount,
                              })
                            : t('nobody-rung', {
                                defaultValue: 'nobody rung',
                              })}
                        </span>
                      )}
                    </ReportTable.Cell>

                    <ReportTable.Cell align="center" className="w-20">
                      {entry.recordUrl ? (
                        <IconPlayerPlayFilled className="mx-auto h-3.5 w-3.5 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </ReportTable.Cell>
                  </ReportTable.Row>
                );
              })}
            </ReportTable.Body>
          </ReportTable>

          <CallHistoryPager
            page={page}
            pageSize={CALL_HISTORY_PAGE_SIZE}
            totalCount={totalCount}
            callerCount={callerCount}
            onPageChange={setPage}
          />
        </div>
      )}
    </SectionCard>
  );
}
