import { useQuery } from '@apollo/client';
import { IconAlertTriangle, IconTruckDelivery } from '@tabler/icons-react';
import dayjs from 'dayjs';
import {
  Alert,
  DatePicker,
  Empty,
  Label,
  ScrollArea,
  Skeleton,
  Table,
  ToggleGroup,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SALES_PAPA_DELIVERY_REPORT } from '../graphql/papaDocuments';
import { papaReportSchema, TPapaReportCounts } from '../utils/papaJson';

const PAPA_REPORT_INTERVALS = ['day', 'month'] as const;
type TPapaReportInterval = (typeof PAPA_REPORT_INTERVALS)[number];

// A daily report covers at most a year (the API refuses more).
const DEFAULT_RANGE_DAYS: Record<TPapaReportInterval, number> = {
  day: 30,
  month: 365,
};

const toDate = (value: unknown) => (value instanceof Date ? value : undefined);

const formatMoney = (value: number) => `${value.toLocaleString()}₮`;

const COLUMNS: {
  key: keyof TPapaReportCounts;
  labelKey: string;
  label: string;
  money?: boolean;
}[] = [
  { key: 'sent', labelKey: 'papa-report-sent', label: 'Sent' },
  { key: 'delivered', labelKey: 'papa-report-delivered', label: 'Delivered' },
  {
    key: 'cancelled',
    labelKey: 'papa-report-cancelled',
    label: 'Cancelled by user',
  },
  { key: 'failed', labelKey: 'papa-report-failed', label: 'Failed' },
  {
    key: 'inProgress',
    labelKey: 'papa-report-in-progress',
    label: 'In progress',
  },
  {
    key: 'revenue',
    labelKey: 'papa-report-revenue',
    label: 'Revenue (delivered)',
    money: true,
  },
  {
    key: 'papaCost',
    labelKey: 'papa-report-cost',
    label: 'Papa cost',
    money: true,
  },
];

/**
 * Papa deliveries of one POS by the day or month they were sent: counts by
 * outcome, the delivered orders' revenue and what Papa charged for them.
 */
export const PapaDeliveryReport = ({ posId }: { posId?: string }) => {
  const { t } = useTranslation('sales');
  const [reportInterval, setReportInterval] =
    useState<TPapaReportInterval>('day');
  const [from, setFrom] = useState<Date>(() =>
    dayjs().subtract(DEFAULT_RANGE_DAYS.day, 'day').startOf('day').toDate(),
  );
  const [to, setTo] = useState<Date>(() => dayjs().startOf('day').toDate());
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    [],
  );

  const changeInterval = (next: TPapaReportInterval) => {
    setReportInterval(next);
    setFrom(
      dayjs(to)
        .subtract(DEFAULT_RANGE_DAYS[next], 'day')
        .startOf(next === 'month' ? 'month' : 'day')
        .toDate(),
    );
  };

  // `to` is the last day shown; the API's end date is exclusive.
  const { data, loading, error } = useQuery(SALES_PAPA_DELIVERY_REPORT, {
    variables: {
      posId,
      startDate: dayjs(from).startOf('day').toISOString(),
      endDate: dayjs(to).add(1, 'day').startOf('day').toISOString(),
      interval: reportInterval,
      timezone,
    },
    skip: !posId || dayjs(to).isBefore(from, 'day'),
    fetchPolicy: 'cache-and-network',
  });

  const report = useMemo(() => {
    const parsed = papaReportSchema.safeParse(data?.salesPapaDeliveryReport);
    return parsed.success ? parsed.data : null;
  }, [data?.salesPapaDeliveryReport]);

  const formatValue = (column: (typeof COLUMNS)[number], value: number) =>
    column.money ? formatMoney(value) : value.toLocaleString();

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>{t('papa-report-from', 'From')}</Label>
            <DatePicker
              value={from}
              onChange={(date) => {
                const next = toDate(date);
                if (next) setFrom(next);
              }}
              maxDate={to}
              clearable={false}
              className="h-8 w-40"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('papa-report-to', 'To')}</Label>
            <DatePicker
              value={to}
              onChange={(date) => {
                const next = toDate(date);
                if (next) setTo(next);
              }}
              minDate={from}
              clearable={false}
              className="h-8 w-40"
            />
          </div>
          <ToggleGroup
            type="single"
            variant="outline"
            className="w-fit"
            value={reportInterval}
            onValueChange={(value) => {
              const next = PAPA_REPORT_INTERVALS.find((item) => item === value);
              if (next) changeInterval(next);
            }}
          >
            <ToggleGroup.Item value="day" className="px-3">
              {t('papa-report-by-day', 'By day')}
            </ToggleGroup.Item>
            <ToggleGroup.Item value="month" className="px-3">
              {t('papa-report-by-month', 'By month')}
            </ToggleGroup.Item>
          </ToggleGroup>
        </div>

        {error && (
          <Alert variant="destructive">
            <IconAlertTriangle />
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-7">
          {COLUMNS.map((column) => (
            <div
              key={column.key}
              className="flex min-w-0 flex-col gap-1 rounded-lg border bg-background px-3 py-2"
            >
              <span className="truncate text-xs text-muted-foreground">
                {t(column.labelKey, column.label)}
              </span>
              {loading && !report ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <span className="text-lg font-semibold tabular-nums">
                  {formatValue(column, report?.totals[column.key] ?? 0)}
                </span>
              )}
            </div>
          ))}
        </div>

        {report && !report.rows.length && (
          <Empty className="border-0 bg-transparent">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconTruckDelivery />
              </Empty.Media>
              <Empty.Title>
                {t('papa-report-empty', 'No Papa deliveries in this period')}
              </Empty.Title>
              <Empty.Description>
                {t(
                  'papa-report-empty-help',
                  'Deliveries are counted by the day they were sent to Papa.',
                )}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        )}

        {!!report?.rows.length && (
          <div className="rounded-lg border">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>
                    {reportInterval === 'month'
                      ? t('papa-report-month', 'Month')
                      : t('papa-report-day', 'Day')}
                  </Table.Head>
                  {COLUMNS.map((column) => (
                    <Table.Head key={column.key} className="text-right">
                      {t(column.labelKey, column.label)}
                    </Table.Head>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {report.rows.map((row) => (
                  <Table.Row key={row.period}>
                    <Table.Cell className="tabular-nums">
                      {row.period}
                    </Table.Cell>
                    {COLUMNS.map((column) => (
                      <Table.Cell
                        key={column.key}
                        className="text-right tabular-nums"
                      >
                        {formatValue(column, row[column.key])}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          {t(
            'papa-report-help',
            'Counted by the day each delivery was sent to Papa. Revenue is the order total of delivered orders; Papa cost is Papa’s fee for them. Failed means Papa cancelled it or no driver took it.',
          )}
        </p>
      </div>
    </ScrollArea>
  );
};
