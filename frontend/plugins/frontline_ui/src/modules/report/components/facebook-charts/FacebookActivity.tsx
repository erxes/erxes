import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { ColumnDef } from '@tanstack/table-core';
import {
  Alert,
  ChartContainer,
  ChartTooltipContent,
  cn,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { AreaGradient } from '../chart/AreaGradient';
import { CustomLegendContent } from '../chart/legend';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import {
  ChartPagination,
  useChartPagination,
} from '../chart-pagination/ChartPagination';
import { FacebookReportFilter } from '../filter-popover/facebook-report-filter';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { useFacebookActivity } from '@/report/hooks/useFacebookReport';
import { useFacebookChartCard } from '@/report/hooks/useFacebookChartCard';
import { getReportChartTypeAtom } from '@/report/states';
import {
  FacebookActivityPoint,
  ReportChart,
  ResponsesChartType,
} from '@/report/types';

const DESCRIPTION = 'Daily Facebook conversations, messages and comments';

interface FacebookActivityProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const FacebookActivity = ({
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: FacebookActivityProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useFacebookChartCard({ title, cardId, savedChart });
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));

  const { facebookActivity, loading, error } = useFacebookActivity({
    variables: { filters: queryFilters },
    skip: !filtersRestored,
  });

  const points = useMemo(() => facebookActivity || [], [facebookActivity]);
  const { pagedData, page, totalPages, totalCount, handlePrev, handleNext } =
    useChartPagination(points, 14);

  const exportColumns = useMemo(
    () => [
      { key: 'date' as const, header: 'Date' },
      { key: 'conversations' as const, header: 'Conversations' },
      { key: 'messages' as const, header: 'Messages' },
      { key: 'comments' as const, header: 'Comments' },
    ],
    [],
  );

  const filterEl = (
    <>
      <FacebookReportFilter cardId={id} />
      <SelectChartType
        onValueChange={setChartType}
        value={chartType}
        hideCircularCharts
      />
      <ReportChartActions
        chartType="facebook-activity"
        visualType={chartType}
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={points}
        columns={exportColumns}
        filename="facebook-activity"
      />
    </>
  );

  if (loading || !filtersRestored) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={DESCRIPTION}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Skeleton />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={DESCRIPTION}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>{t('error-loading-data')}</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (!points.length) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={DESCRIPTION}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Empty />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={DESCRIPTION}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        <div
          className={cn(
            { 'p-4': chartType !== ResponsesChartType.Table },
            'w-full',
          )}
        >
          {chartType === ResponsesChartType.Bar ? (
            <FacebookActivityBarChart points={pagedData} />
          ) : chartType === ResponsesChartType.Table ? (
            <FacebookActivityTable points={pagedData} />
          ) : (
            <FacebookActivityAreaChart points={pagedData} />
          )}
        </div>
        <ChartPagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const activityChartConfig = {
  conversations: { label: 'Conversations', color: 'var(--primary)' },
  messages: { label: 'Messages', color: 'var(--chart-2)' },
  comments: { label: 'Comments', color: 'var(--success)' },
};

interface ActivityChartProps {
  points: FacebookActivityPoint[];
}

export const FacebookActivityAreaChart = memo(
  function FacebookActivityAreaChart({ points }: ActivityChartProps) {
    return (
      <ChartContainer
        config={activityChartConfig}
        className="aspect-video w-full"
      >
        <AreaChart data={points} margin={{ top: 10 }}>
          <defs>
            <AreaGradient id="fb-activity-primary" color="var(--primary)" />
            <AreaGradient id="fb-activity-messages" color="var(--chart-2)" />
            <AreaGradient id="fb-activity-comments" color="var(--success)" />
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Area
            dataKey="conversations"
            type="monotone"
            stroke="var(--primary)"
            fill="url(#fb-activity-primary)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            dataKey="messages"
            type="monotone"
            stroke="var(--chart-2)"
            fill="url(#fb-activity-messages)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            dataKey="comments"
            type="monotone"
            stroke="var(--success)"
            fill="url(#fb-activity-comments)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Legend content={<CustomLegendContent />} />
          <Tooltip content={<ChartTooltipContent />} />
        </AreaChart>
      </ChartContainer>
    );
  },
);

export const FacebookActivityBarChart = memo(function FacebookActivityBarChart({
  points,
}: ActivityChartProps) {
  return (
    <ChartContainer
      config={activityChartConfig}
      className="aspect-video w-full"
    >
      <BarChart
        data={points}
        margin={{ top: 24, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Bar
          dataKey="conversations"
          fill="var(--primary)"
          name="Conversations"
        />
        <Bar dataKey="messages" fill="var(--chart-2)" name="Messages" />
        <Bar dataKey="comments" fill="var(--success)" name="Comments" />
        <Legend content={<CustomLegendContent />} />
        <Tooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
});

export const FacebookActivityTable = memo(function FacebookActivityTable({
  points,
}: ActivityChartProps) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider
        data={points}
        columns={activityTableColumns}
        className="m-3"
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </div>
  );
});

const numberCell = (value: number) => (
  <RecordTableInlineCell className="px-4 text-xs">
    {value ?? 0}
  </RecordTableInlineCell>
);

export const activityTableColumns: ColumnDef<FacebookActivityPoint>[] = [
  {
    id: 'date',
    header: 'Date',
    accessorKey: 'date',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'conversations',
    header: 'Conversations',
    accessorKey: 'conversations',
    cell: ({ cell }) => numberCell(cell.getValue() as number),
    size: 40,
  },
  {
    id: 'messages',
    header: 'Messages',
    accessorKey: 'messages',
    cell: ({ cell }) => numberCell(cell.getValue() as number),
    size: 40,
  },
  {
    id: 'comments',
    header: 'Comments',
    accessorKey: 'comments',
    cell: ({ cell }) => numberCell(cell.getValue() as number),
    size: 40,
  },
];
