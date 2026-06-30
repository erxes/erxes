import { useCallQueueList } from '@/integrations/call/hooks/useCallQueueList';
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
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
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

const useGetColumns = (basePath: string): ColumnDef<any>[] => {
  const { t } = useTranslation('frontline');
  return [
  {
    header: t('queue'),
    accessorKey: 'queue',
    size: 240,
    cell: ({ row, cell }) => {
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
      } = row.original;
      return (
        <HoverCard openDelay={100}>
          <HoverCard.Trigger asChild>
            <Link to={`${basePath}/${cell.getValue()}`} className="block">
              <RecordTableInlineCell>
                <Badge variant="secondary">
                  {cell.getValue() as string} -{' '}
                  {cell.row.original.queuechairman}
                </Badge>
              </RecordTableInlineCell>
            </Link>
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
                <div className="flex-auto space-y-1 text-center">
                  <span className="text-foreground ml-auto font-semibold flex items-center gap-1">
                    <ProgressChart
                      value={Math.round(abandonedRate)}
                      variant="destructive"
                    />
                    {t('pct-of-total', { pct: Math.round(abandonedRate), total: totalCalls })}
                  </span>
                  <legend className="text-accent-foreground text-xs">
                    {t('abandoned')}
                  </legend>
                </div>
                <div className="flex-auto space-y-1 text-center">
                  <span className="text-foreground ml-auto font-semibold flex items-center gap-1">
                    <ProgressChart
                      value={Math.round(answeredRate)}
                      variant="success"
                    />
                    {t('pct-of-total', { pct: Math.round(answeredRate), total: totalCalls })}
                  </span>
                  <legend className="text-accent-foreground text-xs">
                    {t('success-rate-label')}
                  </legend>
                </div>
              </div>
              <p className="text-sm flex items-center gap-1 justify-between">
                <legend className="text-accent-foreground">{t('total')}</legend>
                <span className="font-medium">{totalCalls}</span>
              </p>
              <p className="text-sm flex items-center gap-1 justify-between">
                <legend className="text-accent-foreground">{t('answered')}</legend>
                <span className="font-medium">{answeredCalls}</span>
              </p>
              <p className="text-sm flex items-center gap-1 justify-between">
                <legend className="text-accent-foreground">{t('abandoned')}</legend>
                <span className="font-medium">{abandonedCalls}</span>
              </p>
              <p className="text-sm flex items-center gap-1 justify-between">
                <legend className="text-accent-foreground">
                  {t('average-wait-time')}
                </legend>
                <span className="font-medium">{formatSeconds(avgWait)}</span>
              </p>
              <p className="text-sm flex items-center gap-1 justify-between">
                <legend className="text-accent-foreground">
                  {t('average-talk-time')}
                </legend>
                <span className="font-medium">{formatSeconds(avgTalk)}</span>
              </p>
            </div>
          </HoverCard.Content>
        </HoverCard>
      );
    },
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
            value: value,
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
