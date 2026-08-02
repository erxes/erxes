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
  HoverCard,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { Link } from 'react-router-dom';

export const CallQueueRecordTable = ({
  basePath = '/frontline/calls/dashboard',
}: {
  basePath?: string;
}) => {
  const columns = useGetColumns(basePath);
  const callConfig = useAtomValue(callConfigAtom);
  const { inboxId } = callConfig || {};

  const { callQueueList, loading } = useCallQueueList({
    variables: { inboxId },
    skip: !inboxId,
  });

  if (!callConfig) {
    return null;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={callQueueList || (loading ? [{}] : [])}
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

const CallQueueTrigger = ({
  basePath,
  queue,
  queueChairman,
}: {
  basePath: string;
  queue: string;
  queueChairman: string;
}) => (
  <Link to={`${basePath}/${queue}`} className="block">
    <RecordTableInlineCell>
      <Badge variant="secondary">
        {queue} - {queueChairman}
      </Badge>
    </RecordTableInlineCell>
  </Link>
);

const CallQueueRate = ({
  label,
  totalCalls,
  value,
  variant,
}: {
  label: string;
  totalCalls: number;
  value: number;
  variant: 'destructive' | 'success';
}) => {
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
};

const CallQueueStat = ({ label, value }: { label: string; value: string | number }) => (
  <p className="text-sm flex items-center gap-1 justify-between">
    <legend className="text-accent-foreground">{label}</legend>
    <span className="font-medium">{value}</span>
  </p>
);

const CallQueueSummaryCell = ({
  basePath,
  item,
}: {
  basePath: string;
  item: ICallQueueListItem;
}) => {
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
};

const useGetColumns = (basePath: string): ColumnDef<ICallQueueListItem>[] => {
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
        {t('pct-of-total', { pct: Math.round(cell.getValue() as number), total: cell.row.original.totalCalls })}
      </RecordTableInlineCell>
    ),
  },

  {
    header: t('answered-rate'),
    accessorKey: 'answeredRate',
    cell: ({ cell, row }) => (
      <RecordTableInlineCell className="font-medium">
        <ProgressChart value={cell.getValue() as number} variant="success" />
        {t('pct-of-total', { pct: Math.round(cell.getValue() as number), total: row.original.totalCalls })}
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
};
