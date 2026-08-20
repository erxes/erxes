import { useEffect, useState } from 'react';
import {
  Command,
  Dialog,
  DropdownMenu,
  Filter,
  Spinner,
  cn,
  useFilterQueryState,
} from 'erxes-ui';
import {
  IconCalendar,
  IconChevronDown,
  IconSelector,
  IconX,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { parseCustomTimeRange } from '@/report/utils/dateFilters';
import { useCallFilters } from '../hooks/useCallFilters';
import { DateTimeRangeDialog } from './DateTimeRangeDialog';
import type { SelectOption } from '../types';

const DATE_FILTER_KEY = 'call-report-date';

interface SubHeaderProps {
  integrationOptions: SelectOption[];
  queueOptions: SelectOption[];
  integrationsLoading?: boolean;
  queuesLoading?: boolean;
}

const DATE_PRESETS: SelectOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This week', value: 'this-week' },
  { label: 'Last week', value: 'last-week' },
  { label: 'This month', value: 'this-month' },
  { label: 'Last month', value: 'last-month' },
  { label: 'Last 3 months', value: 'last-3-months' },
  { label: 'This quarter', value: 'this-quarter' },
  { label: 'Last quarter', value: 'last-quarter' },
  { label: 'This year', value: 'this-year' },
  { label: 'Last year', value: 'last-year' },
];

const DIRECTION_OPTIONS: SelectOption[] = [
  { label: 'All Directions', value: 'all' },
  { label: 'Inbound', value: 'Inbound' },
  { label: 'Outbound', value: 'Outbound' },
];

export function SubHeader({
  integrationOptions,
  queueOptions,
  integrationsLoading,
  queuesLoading,
}: SubHeaderProps) {
  const { t } = useTranslation('frontline');
  const {
    integrationId,
    setIntegrationId,
    queueId,
    setQueueId,
    direction,
    setDirection,
    dateFilter,
    setDateFilter,
  } = useCallFilters();

  const [dateQuery, setDateQuery] =
    useFilterQueryState<string>(DATE_FILTER_KEY);
  const [timeRangeOpen, setTimeRangeOpen] = useState(false);
  useEffect(() => {
    if (dateQuery) setDateFilter(dateQuery);
  }, [dateQuery, setDateFilter]);

  const handleClearDate = () => {
    setDateQuery(null);
    setDateFilter('last-3-months');
  };

  const handleSelectPreset = (value: string) => {
    setDateQuery(value);
    setDateFilter(value);
  };

  const integrationLabel =
    integrationOptions.find((o) => o.value === integrationId)?.label ?? '—';
  const queueLabel =
    queueOptions.find((o) => o.value === queueId)?.label ?? '—';
  const directionLabel =
    DIRECTION_OPTIONS.find((o) => o.value === direction)?.label ?? direction;

  return (
    <Filter id="call-reports-subheader">
      <div className="border-b bg-sidebar px-4 py-2 shrink-0 overflow-x-auto styled-scroll">
        <Filter.Bar>
          {integrationsLoading ? (
            <LoadingChip label={t('integrations')} />
          ) : (
            <SelectChip
              label={t('integrations')}
              value={integrationLabel}
              options={integrationOptions}
              onSelect={setIntegrationId}
              selected={integrationId}
            />
          )}

          {queuesLoading ? (
            <LoadingChip label={t('queue')} />
          ) : (
            <SelectChip
              label={t('queue')}
              value={queueLabel}
              options={queueOptions}
              onSelect={setQueueId}
              selected={queueId}
              disabled={!queueOptions.length}
            />
          )}

          <SelectChip
            label={t('direction')}
            value={directionLabel}
            options={DIRECTION_OPTIONS}
            onSelect={setDirection}
            selected={direction}
          />

          <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium">
            <Filter.BarName>
              <IconCalendar className="h-3.5 w-3.5" />
              {t('date')}
            </Filter.BarName>
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <button
                  className={cn(
                    'flex items-center gap-1.5 px-2 bg-background hover:bg-muted-foreground/10 transition-colors',
                    !dateQuery && 'rounded-r',
                  )}
                >
                  {formatDateDisplay(dateQuery ?? dateFilter)}
                  <IconChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start" className="w-44">
                {DATE_PRESETS.map((preset) => (
                  <DropdownMenu.Item
                    key={preset.value}
                    onSelect={() => handleSelectPreset(preset.value)}
                    className={
                      (dateQuery ?? dateFilter) === preset.value
                        ? 'text-primary'
                        : ''
                    }
                  >
                    {t(preset.value, { defaultValue: preset.label })}
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator />
                <DropdownMenu.Item onSelect={() => setTimeRangeOpen(true)}>
                  <IconSelector className="h-3.5 w-3.5" />
                  {t('custom-range', { defaultValue: 'Custom range…' })}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
            {dateQuery && (
              <button
                onClick={handleClearDate}
                className="rounded-r flex items-center px-2 hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={t('clear-date-filter')}
              >
                <IconX className="h-3 w-3" />
              </button>
            )}
          </div>
        </Filter.Bar>
      </div>

      <DateTimeRangeDialog
        open={timeRangeOpen}
        onOpenChange={setTimeRangeOpen}
        value={dateQuery ?? dateFilter}
        onApply={handleSelectPreset}
      />
    </Filter>
  );
}

function formatDateDisplay(value: string): string {
  if (!value) return 'Last 3 months';

  const preset = DATE_PRESETS.find((option) => option.value === value);
  if (preset) return preset.label;

  const timeRange = parseCustomTimeRange(value);
  if (timeRange) {
    const day = (date: Date) =>
      date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    const clock = (date: Date) =>
      `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
      ).padStart(2, '0')}`;

    return day(timeRange.from) === day(timeRange.to)
      ? `${day(timeRange.from)}, ${clock(timeRange.from)} — ${clock(
          timeRange.to,
        )}`
      : `${day(timeRange.from)} ${clock(timeRange.from)} — ${day(
          timeRange.to,
        )} ${clock(timeRange.to)}`;
  }

  if (value.includes(',')) {
    const [from, to] = value.split(',');
    try {
      const fmt = (s: string) =>
        new Date(s).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      const fromDate = fmt(from);
      const toDate = fmt(to);
      return fromDate === toDate ? fromDate : `${fromDate} — ${toDate}`;
    } catch {
      return value;
    }
  }

  const quarter = /^(\d{4})-quarter-([1-4])$/.exec(value);
  if (quarter) {
    return `${quarter[1]} Q${quarter[2]}`;
  }

  const half = /^(\d{4})-half-([1-2])$/.exec(value);
  if (half) {
    return `${half[1]} H${half[2]}`;
  }

  if (/^\d{4}-y$/.test(value)) return value.replace('-y', '');

  return value;
}

function SelectChip({
  label,
  value,
  options,
  onSelect,
  selected,
  disabled,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (v: string) => void;
  selected: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium">
      <Filter.BarName>{label}</Filter.BarName>

      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Filter.BarButton disabled={disabled} className="rounded-r">
            {value}
          </Filter.BarButton>
        </Dialog.Trigger>

        <Dialog.Content className="max-w-xs p-0">
          <Dialog.Header className="px-4 pt-4 pb-2">
            <Dialog.Title className="text-sm font-medium">{label}</Dialog.Title>
          </Dialog.Header>
          <Command>
            {options.length > 5 && (
              <Command.Input placeholder={`Search ${label.toLowerCase()}…`} />
            )}
            <Command.List className="pb-2">
              <Command.Empty>{t('no-options-found')}</Command.Empty>
              <Command.Group>
                {options.map((opt) => (
                  <Command.Item
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      onSelect(opt.value);
                      setOpen(false);
                    }}
                    className="flex items-center justify-between"
                  >
                    {opt.label}
                    {opt.value === selected && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog>
    </div>
  );
}

function LoadingChip({ label }: { label: string }) {
  return (
    <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium opacity-60">
      <Filter.BarName>{label}</Filter.BarName>
      <div className="flex items-center px-3">
        <Spinner className="h-3 w-3" />
      </div>
    </div>
  );
}
