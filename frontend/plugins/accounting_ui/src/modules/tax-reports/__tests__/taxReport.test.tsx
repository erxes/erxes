import { render, screen } from '@testing-library/react';
import { ComponentProps } from 'react';
import { TaxReportBody } from '@/tax-reports/components/TaxReportBody';
import { buildTaxReportPath } from '@/tax-reports/components/TaxReportForm';
import {
  getTaxReportKindFromListKey,
  getTaxReportListKey,
  TaxReportRow,
} from '@/tax-reports/types';
import { parseTaxReportRows } from '@/tax-reports/utils/taxReportRows';
import { parseTaxRowLedgerFormulas } from '@/settings/types/taxRowReport';

jest.mock('react-i18next', () => {
  const translate = (key: string) => key;
  return { useTranslation: () => ({ t: translate }) };
});
jest.mock('erxes-ui', () => {
  const Table = (props: ComponentProps<'table'>) => <table {...props} />;
  return {
    ReportTable: Object.assign(Table, {
      Header: (props: ComponentProps<'thead'>) => <thead {...props} />,
      Body: (props: ComponentProps<'tbody'>) => <tbody {...props} />,
      Row: (props: ComponentProps<'tr'>) => <tr {...props} />,
      Head: (props: ComponentProps<'th'>) => <th {...props} />,
      Cell: (props: ComponentProps<'td'>) => <td {...props} />,
    }),
    Skeleton: () => <span>loading</span>,
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    displayNum: (value: number) => value.toFixed(2),
  };
});
jest.mock('ui-modules', () => ({}));

const row = (
  number: string,
  kind: string,
  extra: Partial<TaxReportRow> = {},
): TaxReportRow => ({
  _id: `row-${number}`,
  number,
  name: `Row ${number}`,
  kind,
  formulaText: '',
  tabCount: 0,
  isBold: false,
  valueSide: '',
  value: 0,
  ...extra,
});

describe('tax report rows', () => {
  it('drops malformed rows from the server payload', () => {
    expect(
      parseTaxReportRows([row('1', 'normal'), { number: 2 }]),
    ).toHaveLength(1);
    expect(parseTaxReportRows(null)).toEqual([]);
  });
});

describe('TaxReportBody', () => {
  it('keeps numbers and amounts on one line while names wrap', () => {
    render(
      <TaxReportBody
        loading={false}
        rows={[
          row('4', 'formula', { formulaText: '(5+...+9)', value: 7000 }),
          row('63', 'formula', { value: -50 }),
        ]}
      />,
    );

    const amount = screen.getByText('7000.00');
    expect(amount.className).toContain('whitespace-nowrap');
    expect(screen.getByText('4(5+...+9)').className).toContain(
      'whitespace-nowrap',
    );
    expect(screen.getByText('Row 4').className).toContain('break-words');
    expect(screen.queryByText('-50.00')).toBeNull();
  });

  it('prints one table, sided rows in debit or credit without a number', () => {
    const { container } = render(
      <TaxReportBody
        loading={false}
        rows={[
          row('5', 'normal', { value: 300 }),
          row('100', 'title'),
          row('101', 'formula', { valueSide: 'credit', value: 120 }),
          row('102', 'formula', { valueSide: 'debit', value: 80 }),
        ]}
      />,
    );

    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(screen.getByText('300.00').previousElementSibling?.textContent).toBe(
      '5',
    );
    expect(screen.queryByText('101')).toBeNull();
    const credit = screen.getByText('120.00');
    const debit = screen.getByText('80.00');
    expect(credit.previousElementSibling?.textContent).toBe('');
    expect(credit.previousElementSibling?.className).toContain(
      'bg-foreground/10',
    );
    expect(debit.nextElementSibling?.textContent).toBe('');
    expect(screen.getByText('Row 100').getAttribute('colspan')).toBe('3');
  });

  it('shows the empty and error states', () => {
    const { rerender } = render(<TaxReportBody loading={false} rows={[]} />);
    expect(screen.getByText('tax-report-no-rows')).toBeTruthy();

    rerender(
      <TaxReportBody
        loading={false}
        rows={[]}
        error={new Error('Tax row 5: Division by zero')}
      />,
    );
    expect(screen.getByRole('alert').textContent).toBe(
      'Tax row 5: Division by zero',
    );
  });
});

describe('tax report links and row formulas', () => {
  it('opens the generated report with kind, whole-day period and filters', () => {
    const path = buildTaxReportPath({
      kind: 'ctax',
      fromDate: new Date(2026, 9, 1, 0, 0),
      toDate: new Date(2026, 9, 31, 23, 59),
      branchId: 'branch',
    });
    const params = new URLSearchParams(path.split('?')[1]);

    expect(path.startsWith('accounting/gen-tax-report?')).toBe(true);
    expect(params.get('kind')).toBe('ctax');
    expect(params.get('fromDate')).toBe('2026-10-01 00:00:00');
    expect(params.get('toDate')).toBe('2026-10-31 23:59:59.999');
    expect(params.get('branchId')).toBe('branch');
  });

  it('keeps only valid stored account formulas', () => {
    expect(
      parseTaxRowLedgerFormulas([
        {
          _id: 'f',
          kind: 'balance',
          plusOrMinus: true,
          percent: '100',
          getDate: 'first',
          debitAccountId: 'acc',
        },
        {
          _id: 'g',
          kind: 'balance',
          plusOrMinus: true,
          percent: '100',
          getDate: 'first',
        },
      ]),
    ).toHaveLength(1);
  });
});

describe('tax report list keys', () => {
  it('round-trips kinds and ignores journal report keys', () => {
    expect(getTaxReportListKey('ctax')).toBe('tax:ctax');
    expect(getTaxReportKindFromListKey(getTaxReportListKey('vat'))).toBe('vat');
    expect(getTaxReportKindFromListKey('tax:other')).toBeUndefined();
    expect(getTaxReportKindFromListKey('mainBalance')).toBeUndefined();
  });
});
