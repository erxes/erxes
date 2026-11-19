import ExcelJS from 'exceljs';
import {
  downloadWorkbook,
  sanitizeFileName,
  sanitizeSheetName,
} from '@/journal-reports/utils/exportJournalReportExcel';
import { ReportValues } from '@/tunable-reports/schema';
import { ReportRunSettings } from '@/tunable-reports/runReport';
import { reportRowIndent } from '@/tunable-reports/reportLayout';
import {
  ReportOrganization,
  reportHtmlLines,
  reportTextHasToken,
} from '@/tunable-reports/reportText';

export interface ReportExcelCell {
  sectionId: string;
  rowId: string;
  columnId: string;
  value?: number | null;
}
export interface ReportExcelInput {
  values: ReportValues;
  cells: ReportExcelCell[];
  settings: ReportRunSettings;
  organization?: ReportOrganization;
  labels: { number: string; name: string };
}

export const REPORT_EXCEL_EMPTY = 'no-report-data-available-to-download';

const NUMBER_COLUMN_WIDTH = 10;
const NAME_COLUMN_WIDTH = 56;
const VALUE_COLUMN_WIDTH = 20;
const FONT_SIZE = 11;
const LINE_HEIGHT = 15;
const BORDER: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
};

export const buildReportWorkbook = ({
  values,
  cells,
  settings,
  organization,
  labels,
}: ReportExcelInput): ExcelJS.Workbook => {
  const context = {
    fromDate: settings.fromDate,
    toDate: settings.toDate,
    organization,
  };
  const sections = values.sections
    .filter((section) => section.isActive)
    .map((section) => ({
      ...section,
      columns: section.columns.filter((column) => column.isActive),
      rows: section.rows.filter((row) => row.isActive),
    }));
  const columnCount =
    2 + Math.max(0, ...sections.map((section) => section.columns.length));
  const cellValues = new Map(
    cells.map((cell) => [
      JSON.stringify([cell.sectionId, cell.rowId, cell.columnId]),
      cell.value,
    ]),
  );
  const unit = settings.amountUnit === 'thousands' ? 1000 : 1;
  const numberFormat = `#,##0${
    settings.decimals ? `.${'0'.repeat(settings.decimals)}` : ''
  }`;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'erxes Accounting';
  workbook.created = new Date();
  const worksheet = workbook.addWorksheet(
    sanitizeSheetName(values.code || values.name),
    {
      pageSetup: {
        paperSize: 9,
        orientation: values.orientation,
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
      },
    },
  );
  worksheet.getColumn(1).width = NUMBER_COLUMN_WIDTH;
  worksheet.getColumn(2).width = NAME_COLUMN_WIDTH;
  for (let column = 3; column <= columnCount; column += 1)
    worksheet.getColumn(column).width = VALUE_COLUMN_WIDTH;

  const textWidth =
    NUMBER_COLUMN_WIDTH +
    NAME_COLUMN_WIDTH +
    (columnCount - 2) * VALUE_COLUMN_WIDTH;

  let line = 0;
  const addText = (text: string, font?: Partial<ExcelJS.Font>) => {
    line += 1;
    const cell = worksheet.getCell(line, 1);
    cell.value = text;
    cell.alignment = { wrapText: true, vertical: 'top' };
    if (font) cell.font = font;
    worksheet.mergeCells(line, 1, line, columnCount);
    const scale = (font?.size ?? FONT_SIZE) / FONT_SIZE;
    const lines = Math.ceil((text.length * scale) / textWidth);
    if (lines > 1) worksheet.getRow(line).height = lines * LINE_HEIGHT * scale;
    return cell;
  };
  const addHtml = (html: string) =>
    reportHtmlLines(html, context).forEach((text) => addText(text));

  const organizationName = organization?.name?.trim();
  if (organizationName && !reportTextHasToken(values.header, 'name'))
    addText(organizationName).alignment = { horizontal: 'center' };
  addText(values.name, { bold: true, size: 16 }).alignment = {
    horizontal: 'center',
  };
  addHtml(values.header);

  sections.forEach((section) => {
    line += 1;
    if (section.name) addText(section.name, { bold: true, size: 12 });
    addHtml(section.header);
    line += 1;
    [labels.number, labels.name, ...section.columns.map(({ name }) => name)]
      .map((text, index) => {
        const cell = worksheet.getCell(line, index + 1);
        cell.value = text;
        return cell;
      })
      .forEach((cell) => {
        cell.font = { bold: true };
        cell.alignment = { wrapText: true, vertical: 'middle' };
        cell.border = BORDER;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E7EB' },
        };
      });
    section.rows.forEach((row) => {
      line += 1;
      const font: Partial<ExcelJS.Font> = {
        bold: row.isBold,
        italic: row.isItalic,
        underline: row.isUnderline,
      };
      const numberCell = worksheet.getCell(line, 1);
      numberCell.value = row.number;
      const nameCell = worksheet.getCell(line, 2);
      nameCell.value = row.name;
      nameCell.alignment = {
        wrapText: true,
        vertical: 'top',
        indent: reportRowIndent(row.tabCount) * 2,
      };
      const valueCells = section.columns.map((column, index) => {
        const cell = worksheet.getCell(line, index + 3);
        const value = cellValues.get(
          JSON.stringify([section._id, row._id, column._id]),
        );
        if (value != null) {
          cell.value = value / unit;
          cell.numFmt = numberFormat;
        }
        cell.alignment = { horizontal: 'right', vertical: 'top' };
        return cell;
      });
      [numberCell, nameCell, ...valueCells].forEach((cell) => {
        cell.font = font;
        cell.border = BORDER;
      });
    });
    addHtml(section.footer);
  });
  line += 1;
  addHtml(values.footer);
  return workbook;
};

export const exportReportExcel = async (
  input: ReportExcelInput,
): Promise<void> => {
  if (
    !input.values.sections.some(
      (section) => section.isActive && section.rows.some((row) => row.isActive),
    )
  )
    throw new Error(REPORT_EXCEL_EMPTY);
  await downloadWorkbook(
    buildReportWorkbook(input),
    `${sanitizeFileName(input.values.name)}-${input.settings.fromDate}_${
      input.settings.toDate
    }.xlsx`,
  );
};
