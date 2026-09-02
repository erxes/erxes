import {
  ICallQueueListItem,
  useCallQueueList,
} from '@/integrations/call/hooks/useCallQueueList';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { formatSeconds } from '@/integrations/call/utils/callUtils';
import { ColumnDef } from '@tanstack/table-core';
import { useTranslation } from 'react-i18next';
import {
  RecordTable,
  RecordTableInlineCell,
  Badge,
  ChartContainer,
  Combobox,
  Command,
  Filter,
  HoverCard,
  PageSubHeader,
  Skeleton,
  cn,
  isUndefinedOrNull,
  useMultiQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { Link } from 'react-router-dom';
import {
  forwardRef,
  useMemo,
  type ComponentProps,
  type ForwardedRef,
} from 'react';

export const CallQueueRecordTable = ({
  basePath = '/frontline/calls/dashboard',
}: {
  basePath?: string;
}) => {
  const { t } = useTranslation('frontline');
  const columns = useGetColumns(basePath);
  const callConfig = useAtomValue(callConfigAtom);
  const { inboxId } = callConfig || {};

  const { callQueueList, loading } = useCallQueueList({
    variables: { inboxId },
    skip: !inboxId,
  });

  const [queries] = useMultiQueryState<{ searchValue?: string }>([
    'searchValue',
  ]);
  const { searchValue } = queries;
  const hasFilters = Object.values(queries || {}).some((v) => v !== null);

  const filteredList = useMemo(() => {
    const list = callQueueList || [];
    if (!searchValue) return list;
    const needle = searchValue.toLowerCase();
    return list.filter(
      (item) =>
        String(item.queue ?? '')
          .toLowerCase()
          .includes(needle) ||
        String(item.queuechairman ?? '')
          .toLowerCase()
          .includes(needle),
    );
  }, [callQueueList, searchValue]);

  if (!callConfig) {
    return null;
  }

  return (
    <>
      <PageSubHeader>
        <Filter id="call-queue-list-filter" sessionKey="call_queue_list">
          <Filter.Popover scope="call-queue-list-page">
            <Filter.Trigger isFiltered={hasFilters} />
            <Combobox.Content>
              <Filter.View>
                <Command>
                  <Filter.CommandInput
                    placeholder={t('filter')}
                    variant="secondary"
                    className="bg-background"
                  />
                  <Command.List className="p-1">
                    <Filter.SearchValueTrigger />
                  </Command.List>
                </Command>
              </Filter.View>
            </Combobox.Content>
          </Filter.Popover>
          <Filter.Dialog>
            <Filter.DialogStringView filterKey="searchValue" />
          </Filter.Dialog>
          <Filter.SearchValueBarItem />
          <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
            {isUndefinedOrNull(callQueueList) || loading ? (
              <Skeleton className="w-20 h-4 inline-block mt-1.5" />
            ) : (
              t('records-found', { count: filteredList.length })
            )}
          </div>
        </Filter>
      </PageSubHeader>
      <RecordTable.Provider
        columns={columns}
        data={filteredList.length ? filteredList : loading ? [{}] : []}
        className="m-3"
        stickyColumns={['queue']}
        tableId="frontline_call_queue_record_table"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header showColumnSelector />
            <RecordTable.Body>
              {loading ? (
                <RecordTable.RowSkeleton rows={6} />
              ) : (
                <RecordTable.RowList />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </>
  );
};

export const ProgressChart = ({
  value,
  variant = 'primary',
}: {
  value: number;
  variant?: 'primary' | 'destructive' | 'success' | 'warning' | 'info';
}) => {
  return (
    <ChartContainer config={{}} className="aspect-square size-6">
      <RadialBarChart
        width={24}
        height={24}
        cx={12}
        cy={12}
        innerRadius={6}
        outerRadius={10}
        data={[
          {
            name: 'Progress',
            value,
            fill: `var(--${variant})`,
          },
        ]}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background={{ fill: 'var(--border)' }}
          dataKey="value"
          cornerRadius={10}
        />
      </RadialBarChart>
    </ChartContainer>
  );
};

type CallQueueTriggerProps = Omit<ComponentProps<typeof Link>, 'to'> & {
  basePath: string;
  queue: string;
  queueChairman: string;
};

function CallQueueTriggerComponent(
  {
    basePath,
    queue,
    queueChairman,
    className,
    ...props
  }: CallQueueTriggerProps,
  ref: ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Link
      {...props}
      ref={ref}
      to={`${basePath}/${queue}`}
      className={cn('block', className)}
    >
      <RecordTableInlineCell>
        <Badge variant="secondary">
          {queue} - {queueChairman}
        </Badge>
      </RecordTableInlineCell>
    </Link>
  );
}

const CallQueueTrigger = forwardRef(CallQueueTriggerComponent);
CallQueueTrigger.displayName = 'CallQueueTrigger';

function CallQueueRate({
  label,
  totalCalls,
  value,
  variant,
}: Readonly<{
  label: string;
  totalCalls: number;
  value: number;
  variant: 'destructive' | 'success';
}>) {
  const { t } = useTranslation('frontline');
  const roundedValue = Math.round(value);

  return (
    <div className="flex-auto space-y-1 text-center">
      <span className="text-foreground ml-auto font-semibold flex items-center gap-1">
        <ProgressChart value={roundedValue} variant={variant} />
        {t('pct-of-total', { pct: roundedValue, total: totalCalls })}
      </span>
      <legend className="text-accent-foreground text-xs">{label}</legend>
    </div>
  );
}

function CallQueueStat({
  label,
  value,
}: Readonly<{
  label: string;
  value: string | number;
}>) {
  return (
    <p className="text-sm flex items-center gap-1 justify-between">
      <legend className="text-accent-foreground">{label}</legend>
      <span className="font-medium">{value}</span>
    </p>
  );
}

function CallQueueSummaryCell({
  basePath,
  item,
}: Readonly<{
  basePath: string;
  item: ICallQueueListItem;
}>) {
  const { t } = useTranslation('frontline');
  const {
    queue,
    queuechairman,
    totalCalls,
    answeredCalls,
    abandonedCalls,
    abandonedRate,
    avgWait,
    avgTalk,
    answeredRate,
  } = item;

  return (
    <HoverCard openDelay={100}>
      <HoverCard.Trigger asChild>
        <CallQueueTrigger
          basePath={basePath}
          queue={queue}
          queueChairman={queuechairman}
        />
      </HoverCard.Trigger>
      <HoverCard.Content
        sideOffset={4}
        side="right"
        align="start"
        className="w-64 bg-accent p-1 rounded-xl"
      >
        <h4 className="text-xs uppercase font-mono font-semibold px-2 leading-8">
          {queue} - {queuechairman}
        </h4>
        <div className="p-3 flex flex-col text-sm bg-background shadow-sm rounded-lg">
          <div className="grid grid-cols-2 gap-1 pb-3">
            <CallQueueRate
              label={t('abandoned')}
              totalCalls={totalCalls}
              value={abandonedRate}
              variant="destructive"
            />
            <CallQueueRate
              label={t('success-rate-label')}
              totalCalls={totalCalls}
              value={answeredRate}
              variant="success"
            />
          </div>
          <CallQueueStat label={t('total')} value={totalCalls} />
          <CallQueueStat label={t('answered')} value={answeredCalls} />
          <CallQueueStat label={t('abandoned')} value={abandonedCalls} />
          <CallQueueStat
            label={t('average-wait-time')}
            value={formatSeconds(avgWait)}
          />
          <CallQueueStat
            label={t('average-talk-time')}
            value={formatSeconds(avgTalk)}
          />
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
}

function useGetColumns(basePath: string): ColumnDef<ICallQueueListItem>[] {
  const { t } = useTranslation('frontline');
  return [
    {
      header: t('queue'),
      accessorKey: 'queue',
      size: 240,
      cell: ({ row }) => (
        <CallQueueSummaryCell basePath={basePath} item={row.original} />
      ),
    },
    {
      header: t('abandoned-rate'),
      accessorKey: 'abandonedRate',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          <ProgressChart
            value={cell.getValue() as number}
            variant="destructive"
          />
          {t('pct-of-total', {
            pct: Math.round(cell.getValue() as number),
            total: cell.row.original.totalCalls,
          })}
        </RecordTableInlineCell>
      ),
    },

    {
      header: t('answered-rate'),
      accessorKey: 'answeredRate',
      cell: ({ cell, row }) => (
        <RecordTableInlineCell className="font-medium">
          <ProgressChart value={cell.getValue() as number} variant="success" />
          {t('pct-of-total', {
            pct: Math.round(cell.getValue() as number),
            total: row.original.totalCalls,
          })}
        </RecordTableInlineCell>
      ),
    },
    {
      header: t('answered-calls'),
      accessorKey: 'answeredCalls',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      header: t('abandoned-calls'),
      accessorKey: 'abandonedCalls',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      header: t('total-calls'),
      accessorKey: 'totalCalls',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      header: t('average-wait-time'),
      accessorKey: 'avgWait',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatSeconds(cell.getValue() as number)}
        </RecordTableInlineCell>
      ),
    },
    {
      header: t('average-talk-time'),
      accessorKey: 'avgTalk',
      cell: ({ cell }) => (
        <RecordTableInlineCell className="font-medium">
          {formatSeconds(cell.getValue() as number)}
        </RecordTableInlineCell>
      ),
    },
  ];
}
