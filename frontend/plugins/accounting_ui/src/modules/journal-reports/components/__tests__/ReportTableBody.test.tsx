import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ReportTableBody } from '@/journal-reports/components/ReportTableBody';

let mockRecords: Record<string, unknown>[] = [];

jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});

jest.mock('react-i18next', () => {
  const translate = (key: string) => key;

  return { useTranslation: () => ({ t: translate }) };
});
jest.mock('erxes-ui', () => {
  const Row = (props: ComponentProps<'tr'>) => <tr {...props} />;
  const Cell = (props: ComponentProps<'td'>) => <td {...props} />;

  return {
    ReportTable: { Row, Cell },
    Button: (props: ComponentProps<'button'>) => <button {...props} />,
    Skeleton: () => <span>loading</span>,
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    displayNum: (value: number) => value.toFixed(2),
  };
});
jest.mock('@/journal-reports/hooks/useJournalReportData', () => ({
  useJournalReportData: () => ({
    records: mockRecords,
    loading: false,
    error: undefined,
  }),
}));
jest.mock('@/journal-reports/hooks/useJournalReportMore', () => ({
  useJournalReportMore: () => ({
    trDetails: [],
    loading: false,
    error: undefined,
  }),
}));

const cashAccount = {
  accountId: 'cash',
  accountCode: '110101',
  accountName: 'Cash on hand',
};

const renderTrialBalance = () =>
  render(
    <MemoryRouter
      initialEntries={[
        '/accounting/journal-reports/gen?report=tb&fromDate=2026-10-01&toDate=2026-10-31',
      ]}
    >
      <table data-slot="table">
        <ReportTableBody />
      </table>
    </MemoryRouter>,
  );

const accountRow = () => screen.getByText('Cash on hand').closest('tr');

describe('ReportTableBody empty journal report', () => {
  it('explains a period with no transactions instead of a blank body', () => {
    mockRecords = [];

    renderTrialBalance();

    expect(screen.getByText('no-transactions-in-period')).toBeTruthy();
  });

  it('explains that every row is zero and reveals them on request', async () => {
    mockRecords = [
      { ...cashAccount, side: 'dt', sumAmount: 250000, isBetween: 0 },
      { ...cashAccount, side: 'ct', sumAmount: 250000, isBetween: 0 },
    ];

    renderTrialBalance();

    expect(await screen.findByText('report-zero-rows-hidden')).toBeTruthy();
    expect(accountRow()?.style.display).toBe('none');

    fireEvent.click(screen.getByRole('button', { name: 'show-empty-rows' }));

    await waitFor(() =>
      expect(screen.queryByText('report-zero-rows-hidden')).toBeNull(),
    );
    expect(accountRow()?.style.display).toBe('');
  });

  it('shows accounts with movement and no empty message', async () => {
    mockRecords = [
      { ...cashAccount, side: 'dt', sumAmount: 1500000, isBetween: 1 },
    ];

    renderTrialBalance();

    await waitFor(() => expect(accountRow()?.style.display).toBe(''));
    expect(screen.getAllByText('1500000.00')).toHaveLength(2);
    expect(screen.queryByText('report-zero-rows-hidden')).toBeNull();
    expect(screen.queryByText('no-transactions-in-period')).toBeNull();
  });
});
