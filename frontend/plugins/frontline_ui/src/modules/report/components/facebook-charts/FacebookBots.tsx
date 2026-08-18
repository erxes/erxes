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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { CustomLegendContent } from '../chart/legend';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import {
  ChartPagination,
  useChartPagination,
} from '../chart-pagination/ChartPagination';
import { FacebookReportFilter } from '../filter-popover/facebook-report-filter';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { SelectChartType } from '../select-chart-type/SelectChartType';
import { useFacebookBots } from '@/report/hooks/useFacebookReport';
import { useFacebookChartCard } from '@/report/hooks/useFacebookChartCard';
import { getReportChartTypeAtom } from '@/report/states';
import {
  FacebookBotRow,
  ReportChart,
  ResponsesChartType,
} from '@/report/types';

const DESCRIPTION = 'Messenger conversations handled by each bot';

const PIE_COLORS = [
  'var(--chart-50)',
  'var(--chart-100)',
  'var(--chart-200)',
  'var(--chart-300)',
  'var(--chart-400)',
  'var(--chart-500)',
  'var(--chart-600)',
  'var(--chart-700)',
];

interface FacebookBotsProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const FacebookBots = ({
  title,
  cardId,
  savedChart,
  colSpan = 6,
  onColSpanChange,
}: FacebookBotsProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useFacebookChartCard({ title, cardId, savedChart });
  const [chartType, setChartType] = useAtom(getReportChartTypeAtom(id));

  const { facebookBots, loading, error } = useFacebookBots({
    variables: { filters: queryFilters },
    skip: !filtersRestored,
  });

  const bots = useMemo(() => facebookBots || [], [facebookBots]);
  const { pagedData, page, totalPages, totalCount, handlePrev, handleNext } =
    useChartPagination(bots);

  const exportColumns = useMemo(
    () => [
      { key: 'name' as const, header: 'Bot' },
      { key: 'count' as const, header: 'Conversations' },
      { key: 'messages' as const, header: 'Bot messages' },
      {
        key: 'percentage' as const,
        header: 'Share of conversations',
        format: (value: number) => `${value}%`,
      },
    ],
    [],
  );

  const filterEl = (
    <>
      <FacebookReportFilter cardId={id} />
      <SelectChartType onValueChange={setChartType} value={chartType} />
      <ReportChartActions
        chartType="facebook-bots"
        visualType={chartType}
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={bots}
        columns={exportColumns}
        filename="facebook-bots"
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

  if (!bots.length) {
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
          {chartType === ResponsesChartType.Pie ? (
            <FacebookBotPieChart bots={pagedData} />
          ) : chartType === ResponsesChartType.Table ? (
            <FacebookBotTable bots={pagedData} />
          ) : (
            <FacebookBotBarChart bots={pagedData} />
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

const botChartConfig = {
  count: { label: 'Conversations', color: 'var(--primary)' },
  messages: { label: 'Bot messages', color: 'var(--chart-2)' },
};

interface BotChartProps {
  bots: FacebookBotRow[];
}

export const FacebookBotBarChart = memo(function FacebookBotBarChart({
  bots,
}: BotChartProps) {
  return (
    <ChartContainer config={botChartConfig} className="aspect-video w-full">
      <BarChart
        data={bots}
        margin={{ top: 24, right: 10, left: 10, bottom: 10 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Bar dataKey="count" fill="var(--primary)" name="Conversations">
          <LabelList
            dataKey="count"
            position="top"
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
        <Bar dataKey="messages" fill="var(--chart-2)" name="Bot messages" />
        <Legend content={<CustomLegendContent />} />
        <Tooltip content={<ChartTooltipContent />} />
      </BarChart>
    </ChartContainer>
  );
});

export const FacebookBotPieChart = memo(function FacebookBotPieChart({
  bots,
}: BotChartProps) {
  const chartData = useMemo(
    () =>
      bots.map((bot, index) => ({
        ...bot,
        fill: PIE_COLORS[index % PIE_COLORS.length],
      })),
    [bots],
  );

  return (
    <ChartContainer config={botChartConfig} className="aspect-video w-full">
      <PieChart>
        <Pie
          dataKey="count"
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={70}
          nameKey="name"
        >
          {chartData.map((bot) => (
            <Cell key={bot._id} fill={bot.fill} />
          ))}
        </Pie>
        <Legend content={<CustomLegendContent />} />
        <Tooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
});

export const FacebookBotTable = memo(function FacebookBotTable({
  bots,
}: BotChartProps) {
  return (
    <div className="bg-sidebar w-full rounded-lg [&_th]:last-of-type:text-right">
      <RecordTable.Provider data={bots} columns={botColumns} className="m-3">
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

export const botColumns: ColumnDef<FacebookBotRow>[] = [
  {
    id: 'name',
    header: 'Bot',
    accessorKey: 'name',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs truncate">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'messages',
    header: 'Bot messages',
    accessorKey: 'messages',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs">
        {(cell.getValue() as number) ?? 0}
      </RecordTableInlineCell>
    ),
    size: 40,
  },
  {
    id: 'count',
    header: 'Conversations',
    accessorKey: 'count',
    cell: ({ cell }) => {
      const { count, percentage } = cell.row.original || {};

      return (
        <RecordTableInlineCell className="px-3 text-xs flex items-center justify-end text-muted-foreground">
          {count} / {percentage}%
        </RecordTableInlineCell>
      );
    },
    size: 40,
  },
];
