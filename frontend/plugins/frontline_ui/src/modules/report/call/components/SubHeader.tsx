import { useEffect, useState } from 'react';
import {
  Command,
  Dialog,
  Filter,
  Spinner,
  useFilterQueryState,
} from 'erxes-ui';
import { IconCalendar, IconX } from '@tabler/icons-react';
import { useCallFilters } from '../hooks/useCallFilters';
import type { SelectOption } from '../types';

const DATE_FILTER_KEY = 'call-report-date';

interface SubHeaderProps {
  integrationOptions: SelectOption[];
  queueOptions: SelectOption[];
  integrationsLoading?: boolean;
  queuesLoading?: boolean;
}

const DIRECTION_OPTIONS: SelectOption[] = [
  { label: 'All Directions', value: 'all' },
  { label: 'Inbound', value: 'Inbound' },
  { label: 'Outbound', value: 'Outbound' },
];

/**
 * Page-level sub-header directly beneath the main PageHeader.
 * Uses erxes-ui `Filter.Bar` chip layout — no dropdown popovers.
 * Each chip opens a `Dialog` for value selection.
 */
export function SubHeader({
  integrationOptions,
  queueOptions,
  integrationsLoading,
  queuesLoading,
}: SubHeaderProps) {
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

  // Sync URL date state → context so sections re-query on change
  const [dateQuery, setDateQuery] = useFilterQueryState<string>(DATE_FILTER_KEY);
  useEffect(() => {
    if (dateQuery) setDateFilter(dateQuery);
  }, [dateQuery, setDateFilter]);

  const handleClearDate = () => {
    setDateQuery(null);
    setDateFilter('last-3-months');
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
          {/* Integration */}
          {integrationsLoading ? (
            <LoadingChip label="Integration" />
          ) : (
            <SelectChip
              label="Integration"
              value={integrationLabel}
              options={integrationOptions}
              onSelect={setIntegrationId}
              selected={integrationId}
            />
          )}

          {/* Queue */}
          {queuesLoading ? (
            <LoadingChip label="Queue" />
          ) : (
            <SelectChip
              label="Queue"
              value={queueLabel}
              options={queueOptions}
              onSelect={setQueueId}
              selected={queueId}
              disabled={!queueOptions.length}
            />
          )}

          {/* Direction */}
          <SelectChip
            label="Direction"
            value={directionLabel}
            options={DIRECTION_OPTIONS}
            onSelect={setDirection}
            selected={direction}
          />

          {/* Date range — opens Filter.DialogDateView (Day/Month/Quarter/Half/Year) */}
          <div className="rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium">
            <Filter.BarName>
              <IconCalendar className="h-3.5 w-3.5" />
              Date
            </Filter.BarName>
            <Filter.BarButton
              inDialog
              filterKey={DATE_FILTER_KEY}
              className={dateQuery ? '' : 'rounded-r'}
            >
              {formatDateDisplay(dateQuery ?? dateFilter)}
            </Filter.BarButton>
            {dateQuery && (
              <button
                onClick={handleClearDate}
                className="rounded-r flex items-center px-2 hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear date filter"
              >
                <IconX className="h-3 w-3" />
              </button>
            )}
          </div>
        </Filter.Bar>
      </div>

      {/* Date range dialog — rendered inside Filter provider so context is available */}
      <Filter.Dialog>
        <Filter.View filterKey={DATE_FILTER_KEY} inDialog>
          <Filter.DialogDateView
            filterKey={DATE_FILTER_KEY}
            label="Date range"
          />
        </Filter.View>
      </Filter.Dialog>
    </Filter>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format the stored date filter value for display in the chip. */
function formatDateDisplay(value: string): string {
  if (!value) return 'Last 3 months';
  if (value === 'last-3-months') return 'Last 3 months';

  // Day range: two ISO timestamps separated by comma
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

  // Quarter: e.g. "2026-quarter1" → "2026 Q1"
  if (value.includes('quarter')) {
    const [year] = value.split('-');
    const n = value.split('quarter')[1];
    return `${year} Q${n}`;
  }

  // Half year: e.g. "2026-half1" → "2026 H1"
  if (value.includes('half')) {
    const [year] = value.split('-');
    const n = value.split('half')[1];
    return `${year} H${n}`;
  }

  // Year: e.g. "2026-y" → "2026"
  if (/^\d{4}-y$/.test(value)) return value.replace('-y', '');

  // Month: e.g. "2026-Jun" — return as-is
  return value;
}

// ─── Chip sub-components ──────────────────────────────────────────────────────

/** A chip that opens a Command list dialog for selecting a value. */
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
              <Command.Empty>No options found</Command.Empty>
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

/** Skeleton chip shown while data is loading. */
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
