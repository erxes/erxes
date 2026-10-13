import ExcelJS from 'exceljs';
import { downloadExcel } from '@/report/utils/exportCsv';
import type { SlaReport } from './types';
import { MISSED_REASON_META } from './components/SlaSection/slaUtils';
import { NO_QUEUE } from './utils';

type Translate = (key: string, fallback: string) => string;

interface SlaExcelOptions {
  report: SlaReport;
  title: string;
  agentLabel: string;
  callbackWindowLabel: string;
  fileName: string;
  t: Translate;
}

const HEADER_FILL = 'FFE9ECEF';

const PBX_OFFSET_MS = 8 * 60 * 60 * 1000;

const pad = (value: number): string => String(value).padStart(2, '0');

const pbxDayKey = (value: string): string => {
  const pbx = new Date(new Date(value).getTime() + PBX_OFFSET_MS);
  return `${pbx.getUTCFullYear()}-${pad(pbx.getUTCMonth() + 1)}-${pad(
    pbx.getUTCDate(),
  )}`;
};

const localTimestamp = (value: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const percentOrBlank = (value: number | null): number | string =>
  value == null ? '' : value / 100;

const addTable = (
  sheet: ExcelJS.Worksheet,
  headers: string[],
  rows: (string | number)[][],
  percentColumns: number[] = [],
) => {
  const header = sheet.addRow(headers);
  header.font = { bold: true };
  header.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_FILL },
    };
  });

  for (const row of rows) sheet.addRow(row);

  for (const column of percentColumns) {
    sheet.getColumn(column).numFmt = '0.0%';
  }

  sheet.columns.forEach((column) => {
    column.width = Math.max(12, ...headers.map((value) => value.length + 2));
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
};

export async function downloadSlaExcel({
  report,
  title,
  agentLabel,
  callbackWindowLabel,
  fileName,
  t,
}: SlaExcelOptions): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const { summary } = report;

  const summarySheet = workbook.addWorksheet(t('summary', 'Summary'));
  summarySheet.addRow([title]).font = { bold: true, size: 13 };
  summarySheet.addRow([]);
  const summaryRows: [string, string | number, boolean?][] = [
    [t('agent', 'Agent'), agentLabel],
    [t('sla-callback-window', 'Callback window'), callbackWindowLabel],
    [
      t('sla-short-abandon-rule', 'Ignored abandons under (s)'),
      report.shortAbandonSeconds,
    ],
    [
      t('kpi-service-level', 'Service Level'),
      percentOrBlank(summary.serviceLevel),
      true,
    ],
    [t('total-calls', 'Total calls'), summary.totalCalls],
    [t('sla-offered', 'Offered'), summary.offeredCalls],
    [t('answered', 'Answered'), summary.answeredCalls],
    [t('sla-called-back', 'Called back'), summary.calledBackCalls],
    [t('sla-breached', 'Breached'), summary.breachedCalls],
    [t('sla-awaiting-callback', 'Awaiting callback'), summary.pendingCallbacks],
    [t('sla-short-abandons', 'Short abandons'), summary.shortAbandonedCalls],
  ];
  for (const [label, value, isPercent] of summaryRows) {
    const row = summarySheet.addRow([label, value]);
    row.getCell(1).font = { bold: true };
    if (isPercent) row.getCell(2).numFmt = '0.0%';
  }
  summarySheet.getColumn(1).width = 30;
  summarySheet.getColumn(2).width = 24;

  addTable(
    workbook.addWorksheet(t('daily', 'Daily')),
    [
      t('date', 'Date'),
      t('sla-offered', 'Offered'),
      t('answered', 'Answered'),
      t('sla-breached', 'Breached'),
      t('kpi-service-level', 'Service Level'),
    ],
    report.series.map((point) => [
      pbxDayKey(point.day),
      point.offeredCalls,
      point.answeredCalls,
      point.breachedCalls,
      percentOrBlank(point.serviceLevel),
    ]),
    [5],
  );

  const missedTotal = report.missedReasons.reduce(
    (sum, { count }) => sum + count,
    0,
  );

  addTable(
    workbook.addWorksheet(t('missed-reasons-sheet', 'Missed reasons')),
    [
      t('reason', 'Reason'),
      t('calls', 'Calls'),
      t('share', 'Share'),
      t('sla-called-back', 'Called back'),
    ],
    report.missedReasons.map((row) => [
      t(
        MISSED_REASON_META[row.reason].key,
        MISSED_REASON_META[row.reason].label,
      ).replace('{{seconds}}', String(report.shortAbandonSeconds)),
      row.count,
      missedTotal ? row.count / missedTotal : '',
      row.calledBack,
    ]),
    [3],
  );

  addTable(
    workbook.addWorksheet(t('queues', 'Queues')),
    [
      t('queue', 'Queue'),
      t('sla-offered', 'Offered'),
      t('answered', 'Answered'),
      t('sla-called-back', 'Called back'),
      t('sla-breached', 'Breached'),
      t('sla-short-abandons', 'Short abandons'),
      t('kpi-service-level', 'Service Level'),
    ],
    report.queues.map((row) => [
      row.queue === NO_QUEUE ? t('no-queue', 'Outside a queue') : row.queue,
      row.offeredCalls,
      row.answeredCalls,
      row.calledBackCalls,
      row.breachedCalls,
      row.shortAbandonedCalls,
      percentOrBlank(row.serviceLevel),
    ]),
    [7],
  );

  addTable(
    workbook.addWorksheet(t('sla-breaches', 'SLA breaches')),
    [
      t('time', 'Time'),
      t('phone', 'Phone'),
      t('queue', 'Queue'),
      t('agent', 'Agent'),
      t('extension', 'Extension'),
      t('sla-waited', 'Waited (s)'),
      t('outcome', 'Outcome'),
      t('call-id', 'Call id'),
    ],
    report.breaches.map((breach) => [
      localTimestamp(breach.startedAt),
      breach.customerPhone ?? '',
      breach.queue ?? '',
      breach.agentName ?? '',
      breach.agent ?? '',
      breach.waitTime,
      breach.isPendingCallback
        ? t('sla-awaiting-callback', 'Awaiting callback')
        : t('sla-abandoned', 'Abandoned'),
      breach.uniqueid,
    ]),
  );

  downloadExcel(await workbook.xlsx.writeBuffer(), fileName);
}
