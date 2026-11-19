import { render, screen, within } from '@testing-library/react';
import { ReportPaper } from '../ReportPreview';
import { buildReportWorkbook } from '../exportReportExcel';
import { defaultReportRunSettings } from '../runReport';
import { newColumn, newReport } from '../values';
import { reportRow } from './reportTestKit';
import { ReportValues } from '../schema';

jest.mock('../locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const kit =
    jest.requireActual<typeof import('./reportTestKit')>('./reportTestKit');
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    Table: kit.tableMock,
  };
});

const balanceSheet = (columnNames: string[]): ReportValues => {
  const report = newReport('Санхүүгийн байдлын тайлан');
  const section = report.sections[0];
  section._id = 'assets';
  section.columns = columnNames.map((name, index) => ({
    ...newColumn(name),
    _id: `c${index + 1}`,
  }));
  section.rows = [
    reportRow('1', 'Мөнгө ба түүнтэй адилтгах хөрөнгө'),
    reportRow('2', 'Дансны авлага', { tabCount: 1 }),
    reportRow('3', 'Нийт хөрөнгө', { isBold: true }),
  ];
  return report;
};
const widths = (container: HTMLElement): number[] =>
  Array.from(container.querySelectorAll('col'), (col) =>
    Number.parseFloat(col.style.width),
  );
const amounts = (name: string): (string | null)[] =>
  within(screen.getByText(name).closest('tr') as HTMLElement)
    .getAllByRole('cell')
    .slice(2)
    .map((cell) => cell.textContent);
const excelIndents = (
  sheet: ReturnType<typeof buildReportWorkbook>['worksheets'][number],
): Map<unknown, number | undefined> => {
  const indents = new Map<unknown, number | undefined>();
  sheet.eachRow((sheetRow) =>
    indents.set(
      sheetRow.getCell(2).value,
      sheetRow.getCell(2).alignment?.indent,
    ),
  );
  return indents;
};
const formatted = (value: number): string =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

test('prints generated amounts in the chosen unit and leaves cells without a value empty', () => {
  render(
    <ReportPaper
      values={balanceSheet(['Эхний үлдэгдэл', 'Эцсийн үлдэгдэл'])}
      settings={{
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        amountUnit: 'thousands',
        decimals: 1,
      }}
      cells={[
        { sectionId: 'assets', rowId: '1', columnId: 'c1', value: 12345678 },
        { sectionId: 'assets', rowId: '1', columnId: 'c2', value: -2500 },
        { sectionId: 'assets', rowId: '3', columnId: 'c2', value: 0 },
        { sectionId: 'assets', rowId: '2', columnId: 'c1', value: null },
      ]}
    />,
  );
  expect(amounts('Мөнгө ба түүнтэй адилтгах хөрөнгө')).toEqual([
    formatted(12345.678),
    formatted(-2.5),
  ]);
  expect(amounts('Дансны авлага')).toEqual(['', '']);
  expect(amounts('Нийт хөрөнгө')).toEqual(['', formatted(0)]);
  expect(screen.getByText('Нийт хөрөнгө').closest('tr')?.className).toContain(
    'font-bold',
  );
});

test('a two-column report keeps the wide name column while an eight-column report gives the amounts room', () => {
  const narrow = render(
    <ReportPaper values={balanceSheet(['Эхний', 'Эцсийн'])} />,
  );
  expect(widths(narrow.container)).toEqual([8, 52, 20, 20]);
  narrow.unmount();

  const wide = render(
    <ReportPaper
      values={balanceSheet([
        'Өмч',
        'Халаасны хувьцаа',
        'Нэмж төлөгдсөн капитал',
        'Дахин үнэлгээний нэмэгдэл',
        'Гадаад валютын нөөц',
        'Эздийн өмчийн бусад хэсэг',
        'Хуримтлагдсан ашиг',
        'Нийт дүн',
      ])}
    />,
  );
  const [number, name, ...amounts] = widths(wide.container);
  expect(amounts).toHaveLength(8);
  amounts.forEach((width) => expect(width).toBeGreaterThanOrEqual(9));
  expect(name).toBeGreaterThanOrEqual(20);
  expect(number + name + amounts.reduce((sum, width) => sum + width, 0)).toBe(
    100,
  );
});

test('the organization line is printed above the title unless the header already places the name', () => {
  const report = balanceSheet(['Эцсийн үлдэгдэл']);
  const organization = { name: 'Алтай Тайга Тур ХХК' };
  const { rerender } = render(
    <ReportPaper values={report} organization={organization} />,
  );
  expect(screen.getByText('Алтай Тайга Тур ХХК').tagName).toBe('P');
  rerender(
    <ReportPaper
      values={{ ...report, header: '<b>Байгууллага: {name}</b>' }}
      organization={organization}
    />,
  );
  expect(screen.getAllByText(/Алтай Тайга Тур ХХК/)).toHaveLength(1);
  expect(screen.getByText('Байгууллага: Алтай Тайга Тур ХХК').tagName).toBe(
    'B',
  );
});

test('a half-finished draft still renders: no columns, hidden rows and sections are skipped', () => {
  const report = balanceSheet([]);
  report.sections[0].rows[1].isActive = false;
  report.sections.push({
    ...report.sections[0],
    _id: 'hidden',
    name: 'Нуусан хэсэг',
    isActive: false,
  });
  const { container } = render(<ReportPaper values={report} />);
  expect(widths(container)).toEqual([8, 92]);
  expect(screen.getByText('Нийт хөрөнгө')).toBeTruthy();
  expect(screen.queryByText('Дансны авлага')).toBeNull();
  expect(screen.queryByText('Нуусан хэсэг')).toBeNull();
});

test('amount columns keep their share as a report grows from four to twelve columns and the row never overflows the page', () => {
  const names = (count: number) =>
    Array.from({ length: count }, (_, index) => `${index + 1}-р сар`);
  const four = render(<ReportPaper values={balanceSheet(names(4))} />);
  expect(widths(four.container)).toEqual([8, 44, 12, 12, 12, 12]);
  four.unmount();
  const five = render(<ReportPaper values={balanceSheet(names(5))} />);
  expect(widths(five.container)).toEqual([6, 34, 12, 12, 12, 12, 12]);
  five.unmount();
  const year = render(<ReportPaper values={balanceSheet(names(12))} />);
  const [number, name, ...months] = widths(year.container);
  expect(months).toHaveLength(12);
  expect(name).toBe(20);
  expect(new Set(months).size).toBe(1);
  expect(
    number + name + months.reduce((sum, width) => sum + width, 0),
  ).toBeCloseTo(100);
});

test('a mistyped indent of a billion levels still opens the preview and the Excel sheet widens the name column instead of hiding the name', () => {
  const report = balanceSheet(['Эцсийн үлдэгдэл']);
  report.sections[0].rows[1].tabCount = 1_000_000_000;
  render(<ReportPaper values={report} />);
  const indent = screen
    .getByText('Дансны авлага')
    .closest('td')
    ?.querySelector('[aria-hidden="true"]');
  expect(indent?.textContent).toHaveLength(80);
  const sheet = buildReportWorkbook({
    values: report,
    cells: [],
    settings: defaultReportRunSettings(),
    labels: { number: '№', name: 'Үзүүлэлт' },
  }).worksheets[0];
  expect(excelIndents(sheet).get('Дансны авлага')).toBe(20);
  expect(sheet.getColumn(2).width).toBe(116);
});

test('deeply nested rows keep their own level in Excel and a flat report keeps the usual name column', () => {
  const nested = balanceSheet(['Эцсийн үлдэгдэл']);
  nested.sections[0].rows[0].tabCount = 6;
  nested.sections[0].rows[1].tabCount = 7;
  const input = {
    cells: [],
    settings: defaultReportRunSettings(),
    labels: { number: '№', name: 'Үзүүлэлт' },
  };
  const sheet = buildReportWorkbook({ ...input, values: nested }).worksheets[0];
  const indents = excelIndents(sheet);
  expect(indents.get('Мөнгө ба түүнтэй адилтгах хөрөнгө')).toBe(6);
  expect(indents.get('Дансны авлага')).toBe(7);
  expect(indents.get('Нийт хөрөнгө')).toBe(0);
  expect(sheet.getColumn(2).width).toBe(77);
  const flat = balanceSheet(['Эцсийн үлдэгдэл']);
  flat.sections[0].rows[1].tabCount = 0;
  expect(
    buildReportWorkbook({ ...input, values: flat }).worksheets[0].getColumn(2)
      .width,
  ).toBe(56);
});
