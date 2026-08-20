import ExcelJS from 'exceljs';
import { downloadExcel } from '@/report/utils/exportCsv';
import type { DayHourCell, HeatMetric } from './types';

interface HeatmapExcelOptions {
  cells: DayHourCell[];
  startDate: string;
  endDate: string;
  metric: HeatMetric;
  title: string;
  dateHeader: string;
  totalHeader: string;
  sheetName: string;
  fileName: string;
}

const HEADER_FILL = 'FFE9ECEF';
const PEAK_FILL = 'FFD3EDDA';
const TITLE_ROW = 1;
const HEADER_ROW = 3;

const PBX_OFFSET_MS = 8 * 60 * 60 * 1000;

const pad = (value: number): string => String(value).padStart(2, '0');

const dayKey = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const pbxDayKey = (value: string): string => {
  const pbx = new Date(new Date(value).getTime() + PBX_OFFSET_MS);
  return `${pbx.getUTCFullYear()}-${pad(pbx.getUTCMonth() + 1)}-${pad(
    pbx.getUTCDate(),
  )}`;
};

const hourHeader = (hour: number): string =>
  `${pad(hour)}:00-${pad((hour + 1) % 24)}:00`;

const excelDate = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

const daysInRange = (startDate: string, endDate: string): Date[] => {
  const days: Date[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return days;

  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  );

  while (cursor.getTime() <= end.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

const hourWindow = (cells: DayHourCell[]): number[] => {
  const busy = cells.filter((cell) => cell.total > 0).map((cell) => cell.hour);
  if (!busy.length) return Array.from({ length: 24 }, (_, hour) => hour);

  const from = Math.min(...busy);
  const to = Math.max(...busy);
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
};

export const buildHeatmapWorkbook = ({
  cells,
  startDate,
  endDate,
  metric,
  title,
  dateHeader,
  totalHeader,
  sheetName,
}: Omit<HeatmapExcelOptions, 'fileName'>): ExcelJS.Workbook => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  const hours = hourWindow(cells);
  const days = daysInRange(startDate, endDate);

  const valueByCell = new Map<string, number>();
  for (const cell of cells) {
    if (Number.isNaN(new Date(cell.day).getTime())) continue;
    valueByCell.set(`${pbxDayKey(cell.day)}:${cell.hour}`, cell[metric]);
  }

  sheet.columns = [
    { width: 14 },
    ...hours.map(() => ({ width: 13 })),
    { width: 10 },
  ];

  sheet.getCell(TITLE_ROW, 1).value = title;
  sheet.getCell(TITLE_ROW, 1).font = { bold: true, size: 12 };

  const header = sheet.getRow(HEADER_ROW);
  header.values = [dateHeader, ...hours.map(hourHeader), totalHeader];
  header.font = { bold: true };
  header.alignment = { horizontal: 'center' };
  header.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: HEADER_FILL },
    };
  });

  const columnTotals = hours.map(() => 0);

  days.forEach((day, index) => {
    const row = sheet.getRow(HEADER_ROW + 1 + index);
    const values = hours.map(
      (hour) => valueByCell.get(`${dayKey(day)}:${hour}`) ?? 0,
    );
    const peak = Math.max(...values);

    row.getCell(1).value = excelDate(day);
    row.getCell(1).numFmt = 'm/d/yyyy';

    values.forEach((value, column) => {
      const cell = row.getCell(column + 2);
      cell.value = value;
      cell.alignment = { horizontal: 'center' };

      if (peak > 0 && value === peak) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: PEAK_FILL },
        };
        cell.font = { bold: true };
      }

      columnTotals[column] += value;
    });

    const rowTotal = row.getCell(hours.length + 2);
    rowTotal.value = values.reduce((sum, value) => sum + value, 0);
    rowTotal.font = { bold: true };
    rowTotal.alignment = { horizontal: 'center' };
  });

  const footer = sheet.getRow(HEADER_ROW + 1 + days.length);
  footer.values = [
    totalHeader,
    ...columnTotals,
    columnTotals.reduce((sum, value) => sum + value, 0),
  ];
  footer.font = { bold: true };
  footer.alignment = { horizontal: 'center' };
  footer.getCell(1).alignment = { horizontal: 'left' };

  sheet.views = [
    { state: 'frozen', xSplit: 1, ySplit: HEADER_ROW, activeCell: 'B4' },
  ];

  return workbook;
};

export const downloadHeatmapExcel = async ({
  fileName,
  ...options
}: HeatmapExcelOptions): Promise<void> => {
  const buffer = await buildHeatmapWorkbook(options).xlsx.writeBuffer();
  downloadExcel(buffer, fileName);
};
