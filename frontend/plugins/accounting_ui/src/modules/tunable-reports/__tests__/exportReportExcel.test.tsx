import { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type ExcelJS from 'exceljs';
import { buildReportWorkbook, exportReportExcel } from '../exportReportExcel';
import { ReportExcelButton } from '../ReportExcelButton';
import { newColumn, newReport } from '../values';
import { reportRow } from './reportTestKit';
import { ReportValues } from '../schema';
import { ReportRunSettings } from '../runReport';

const mockDownload = jest.fn();
const mockNotify = jest.fn();
jest.mock('@/journal-reports/utils/exportJournalReportExcel', () => ({
  ...jest.requireActual<
    typeof import('@/journal-reports/utils/exportJournalReportExcel')
  >('@/journal-reports/utils/exportJournalReportExcel'),
  downloadWorkbook: (...args: unknown[]) => mockDownload(...args),
}));
jest.mock('@/utils/graphqlMutation', () => ({
  notifyMutationResult: (...args: unknown[]) => mockNotify(...args),
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => ({
  Button: ({ children, disabled, onClick }: ComponentProps<'button'>) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

const incomeStatement = (): ReportValues => {
  const report = newReport('Орлогын тайлан / 2026');
  report.code = 'СТ2';
  report.orientation = 'landscape';
  report.header =
    '<p style="text-align:center"><b>{name}</b></p><p>{begin_date} - {end_date}<br>Утас: {phone1}</p>';
  report.footer =
    '<table><tr><td>Захирал</td><td>Б.Болд</td></tr></table><script>alert(1)</script>';
  const section = report.sections[0];
  section._id = 'income';
  section.name = 'Үндсэн үйл ажиллагаа';
  section.columns = [
    { ...newColumn('Өмнөх он'), _id: 'prev' },
    { ...newColumn('Тайлант он'), _id: 'now' },
    { ...newColumn('Нуусан'), _id: 'off', isActive: false },
  ];
  section.rows = [
    reportRow('1', 'Борлуулалтын орлого'),
    reportRow('1.1', 'Аяллын орлого', { tabCount: 2, isItalic: true }),
    reportRow('2', 'Нийт ашиг', { isBold: true, isUnderline: true }),
    reportRow('9', 'Ашиглахгүй мөр', { isActive: false }),
  ];
  return report;
};
const settings: ReportRunSettings = {
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  amountUnit: 'thousands',
  decimals: 2,
};
const cells = [
  { sectionId: 'income', rowId: '1', columnId: 'prev', value: 98000000 },
  { sectionId: 'income', rowId: '1', columnId: 'now', value: 125500000 },
  { sectionId: 'income', rowId: '1.1', columnId: 'now', value: null },
  { sectionId: 'income', rowId: '2', columnId: 'now', value: -4250500 },
];
const organization = {
  name: 'Алтай Тайга Тур ХХК',
  phoneNumber: '+976 9911 2233',
};
const labels = { number: '№', name: 'Үзүүлэлт' };
const sheetRows = (sheet: ExcelJS.Worksheet): unknown[][] => {
  const rows: unknown[][] = [];
  sheet.eachRow((sheetRow) => {
    const values: unknown[] = [];
    sheetRow.eachCell({ includeEmpty: true }, (cell) =>
      values.push(
        cell.isMerged && cell.master !== cell ? undefined : cell.value,
      ),
    );
    rows.push(values.filter((value) => value !== undefined && value !== null));
  });
  return rows;
};
const findRow = (sheet: ExcelJS.Worksheet, name: string): ExcelJS.Row => {
  let found: ExcelJS.Row | undefined;
  sheet.eachRow((sheetRow) => {
    if (sheetRow.getCell(2).value === name) found = sheetRow;
  });
  if (!found) throw new Error(`Row "${name}" is missing from the sheet`);
  return found;
};
afterEach(() => jest.clearAllMocks());

test('an accountant gets the printed report as a sheet: titles, period, amounts in thousands and row styles', () => {
  const workbook = buildReportWorkbook({
    values: incomeStatement(),
    cells,
    settings,
    organization,
    labels,
  });
  const sheet = workbook.worksheets[0];
  expect(sheet.name).toBe('СТ2');
  expect(sheet.pageSetup.orientation).toBe('landscape');
  expect(sheetRows(sheet)).toEqual([
    ['Орлогын тайлан / 2026'],
    ['Алтай Тайга Тур ХХК'],
    ['2026-01-01 - 2026-12-31'],
    ['Утас: +976 9911 2233'],
    ['Үндсэн үйл ажиллагаа'],
    ['№', 'Үзүүлэлт', 'Өмнөх он', 'Тайлант он'],
    ['1', 'Борлуулалтын орлого', 98000, 125500],
    ['1.1', 'Аяллын орлого'],
    ['2', 'Нийт ашиг', -4250.5],
    ['Захирал Б.Болд'],
  ]);
  const revenue = findRow(sheet, 'Борлуулалтын орлого');
  expect(revenue.getCell(4).numFmt).toBe('#,##0.00');
  const tours = findRow(sheet, 'Аяллын орлого');
  expect(tours.getCell(2).alignment.indent).toBe(4);
  expect(tours.getCell(2).font.italic).toBe(true);
  const profit = findRow(sheet, 'Нийт ашиг');
  expect(profit.getCell(4).font).toMatchObject({ bold: true, underline: true });
  expect(profit.getCell(3).value).toBeNull();
});

test('whole units without decimals are written as plain integers and the company line is added when the header has no name', () => {
  const report = incomeStatement();
  report.header = '';
  const sheet = buildReportWorkbook({
    values: report,
    cells,
    settings: { ...settings, amountUnit: 'units', decimals: 0 },
    organization,
    labels,
  }).worksheets[0];
  expect(sheetRows(sheet).slice(0, 2)).toEqual([
    ['Алтай Тайга Тур ХХК'],
    ['Орлогын тайлан / 2026'],
  ]);
  const revenue = findRow(sheet, 'Борлуулалтын орлого');
  expect(revenue.getCell(4).value).toBe(125500000);
  expect(revenue.getCell(4).numFmt).toBe('#,##0');
});

test('download names the file after the report and period', async () => {
  mockDownload.mockResolvedValue(undefined);
  await exportReportExcel({
    values: incomeStatement(),
    cells,
    settings,
    organization,
    labels,
  });
  expect(mockDownload).toHaveBeenCalledTimes(1);
  expect(mockDownload.mock.calls[0][1]).toBe(
    'орлогын-тайлан---2026-2026-01-01_2026-12-31.xlsx',
  );
});

test('a report whose rows are all switched off is not downloaded as an empty file', async () => {
  const report = incomeStatement();
  report.sections[0].rows.forEach((reportRow) => {
    reportRow.isActive = false;
  });
  await expect(
    exportReportExcel({ values: report, cells: [], settings, labels }),
  ).rejects.toThrow('no-report-data-available-to-download');
  expect(mockDownload).not.toHaveBeenCalled();
});

const generated = (report: ReportValues) =>
  ({ _id: 'r', version: 1, ...report } as ComponentProps<
    typeof ReportExcelButton
  >['report']);

test('the Excel button confirms a finished download and reports a failed one', async () => {
  mockDownload.mockResolvedValueOnce(undefined);
  render(
    <ReportExcelButton
      report={generated(incomeStatement())}
      cells={cells}
      settings={settings}
      organization={organization}
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'download-excel' }));
  await waitFor(() =>
    expect(mockNotify).toHaveBeenCalledWith(
      true,
      'report-downloaded-as-an-excel-file',
    ),
  );
  mockDownload.mockRejectedValueOnce('disk full');
  fireEvent.click(screen.getByRole('button', { name: 'download-excel' }));
  await waitFor(() =>
    expect(mockNotify).toHaveBeenLastCalledWith(
      false,
      'unable-to-generate-the-excel-file',
    ),
  );
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'download-excel' })
      .disabled,
  ).toBe(false);
});

test('the Excel button stays off until a report has been generated', () => {
  render(<ReportExcelButton settings={settings} />);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'download-excel' })
      .disabled,
  ).toBe(true);
});

test('a long note under the table gets a taller row so the whole paragraph stays readable', () => {
  const report = incomeStatement();
  const note =
    'Энэхүү тайланг Сангийн сайдын тушаалаар баталсан маягтын дагуу бэлтгэсэн бөгөөд тайлант хугацааны орлого, зардлыг аккруэл сууриар хүлээн зөвшөөрч, гадаад валютын үлдэгдлийг тайлангийн өдрийн Монголбанкны албан ханшаар хөрвүүлэн тусгасан болно.';
  report.footer = `<p>${note}</p><p>Захирал Б.Болд</p>`;
  const sheet = buildReportWorkbook({
    values: report,
    cells,
    settings,
    organization,
    labels,
  }).worksheets[0];
  const heights = new Map<unknown, number | undefined>();
  sheet.eachRow((sheetRow) =>
    heights.set(sheetRow.getCell(1).value, sheetRow.height),
  );
  expect(heights.get(note)).toBeGreaterThanOrEqual(45);
  expect(heights.has('Захирал Б.Болд')).toBe(true);
  expect(heights.get('Захирал Б.Болд')).toBeUndefined();
});

test('the Excel button explains an empty report and keeps technical errors out of the message', async () => {
  const empty = incomeStatement();
  empty.sections[0].rows.forEach((reportRow) => {
    reportRow.isActive = false;
  });
  const { rerender } = render(
    <ReportExcelButton report={generated(empty)} settings={settings} />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'download-excel' }));
  await waitFor(() =>
    expect(mockNotify).toHaveBeenLastCalledWith(
      false,
      'no-report-data-available-to-download',
    ),
  );
  expect(mockDownload).not.toHaveBeenCalled();
  rerender(
    <ReportExcelButton
      report={generated(incomeStatement())}
      cells={cells}
      settings={settings}
    />,
  );
  mockDownload.mockRejectedValueOnce(
    new Error('QuotaExceededError: The quota has been exceeded.'),
  );
  fireEvent.click(screen.getByRole('button', { name: 'download-excel' }));
  await waitFor(() =>
    expect(mockNotify).toHaveBeenLastCalledWith(
      false,
      'unable-to-generate-the-excel-file',
    ),
  );
});
