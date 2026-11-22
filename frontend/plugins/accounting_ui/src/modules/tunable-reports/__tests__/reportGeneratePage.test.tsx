import { ComponentProps } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TunableReportPrintPage } from '~/pages/TunableReportPrintPage';
import { REPORT_GENERATE } from '../graphql';

const mockQuery = jest.fn();
jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});
jest.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockQuery(...args),
}));
jest.mock('../locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/journal-reports/hooks/useJournalReportOrganizationName', () => ({
  useJournalReportOrganizationName: () => ({
    organizationName: 'Company',
    phoneNumber: '+976 7011 2233',
    email: 'info@company.mn',
    loading: false,
  }),
}));
jest.mock('../ReportRunSheet', () => ({
  ReportRunSheet: ({
    defaultValues,
    onRun,
  }: {
    defaultValues?: {
      fromDate: string;
      toDate: string;
      amountUnit: 'units' | 'thousands';
      decimals: number;
    };
    onRun: (settings: {
      fromDate: string;
      toDate: string;
      amountUnit: 'units' | 'thousands';
      decimals: number;
    }) => void;
  }) => (
    <div role="dialog">
      <span>
        {defaultValues?.fromDate} - {defaultValues?.toDate}
      </span>
      <button
        onClick={() =>
          onRun({
            fromDate: '2025-01-01',
            toDate: '2025-06-30',
            amountUnit: 'units',
            decimals: 2,
          })
        }
      >
        first half of 2025
      </button>
      <button onClick={() => defaultValues && onRun(defaultValues)}>
        same period again
      </button>
    </div>
  ),
}));
jest.mock('../ReportExcelButton', () => ({
  ReportExcelButton: ({
    disabled,
    organization,
  }: {
    disabled?: boolean;
    organization?: { name?: string; phoneNumber?: string };
  }) => (
    <button disabled={disabled}>
      excel for {organization?.name} {organization?.phoneNumber}
    </button>
  ),
}));
jest.mock('../ReportPreview', () => ({
  ReportPreview: ({ cells }: { cells?: { value: number | null }[] }) => (
    <output aria-label="generated cells">{JSON.stringify(cells)}</output>
  ),
}));
jest.mock('erxes-ui', () => ({
  Button: ({
    children,
    disabled,
    onClick,
  }: ComponentProps<'button'> & { asChild?: boolean }) => (
    <button disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Spinner: () => <span>loading</span>,
}));
const Page = ({ search }: { search: string }) => (
  <MemoryRouter
    initialEntries={[`/accounting/tunable-reports/r/print?${search}`]}
  >
    <Routes>
      <Route
        path="/accounting/tunable-reports/:id/print"
        element={<TunableReportPrintPage />}
      />
    </Routes>
  </MemoryRouter>
);
const params =
  'fromDate=2026-01-01&toDate=2026-12-31&amountUnit=thousands&decimals=0&inPreview=true';
afterEach(() => jest.clearAllMocks());

test('print calls Generate with the run parameters and passes generated cells to the preview', () => {
  mockQuery.mockReturnValue({
    data: {
      accountingTunableReportGenerate: {
        report: { _id: 'r', orientation: 'portrait' },
        cells: [{ sectionId: 's', rowId: 'row', columnId: 'c', value: 0 }],
      },
    },
    loading: false,
  });
  render(<Page search={params} />);
  expect(mockQuery).toHaveBeenCalledWith(
    REPORT_GENERATE,
    expect.objectContaining({
      variables: {
        _id: 'r',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        amountUnit: 'thousands',
        decimals: 0,
      },
      skip: false,
      fetchPolicy: 'network-only',
    }),
  );
  expect(screen.getByLabelText('generated cells').textContent).toContain(
    '"value":0',
  );
});

test('invalid preview dates do not run Generate', () => {
  mockQuery.mockReturnValue({ loading: false });
  render(<Page search="fromDate=2026-02-30&toDate=2026-12-31" />);
  expect(mockQuery).toHaveBeenCalledWith(
    REPORT_GENERATE,
    expect.objectContaining({ skip: true }),
  );
  expect(screen.getByRole('alert').textContent).toBe('dateError');
});

const generated = {
  data: {
    accountingTunableReportGenerate: {
      report: { _id: 'r', name: 'Balance report', orientation: 'portrait' },
      cells: [{ sectionId: 's', rowId: 'row', columnId: 'c', value: 0 }],
    },
  },
  loading: false,
};
const button = (name: RegExp | string) =>
  screen.getByRole<HTMLButtonElement>('button', { name });

test('the period can be changed on the print page and the report is generated again in the same tab', () => {
  mockQuery.mockReturnValue(generated);
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  render(<Page search={params} />);
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(button('run'));
  expect(screen.getByRole('dialog').textContent).toContain(
    '2026-01-01 - 2026-12-31',
  );
  fireEvent.click(button('first half of 2025'));
  expect(mockQuery).toHaveBeenLastCalledWith(
    REPORT_GENERATE,
    expect.objectContaining({
      variables: {
        _id: 'r',
        fromDate: '2025-01-01',
        toDate: '2025-06-30',
        amountUnit: 'units',
        decimals: 2,
      },
      skip: false,
    }),
  );
  expect(open).not.toHaveBeenCalled();
  open.mockRestore();
});

test('Excel and Print unlock only for a generated report and carry the organization details', () => {
  mockQuery.mockReturnValue({ loading: true });
  const { unmount } = render(<Page search={params} />);
  expect(button(/excel/).disabled).toBe(true);
  expect(button('print').disabled).toBe(true);
  unmount();

  mockQuery.mockReturnValue(generated);
  render(<Page search={params} />);
  expect(button('excel for Company +976 7011 2233').disabled).toBe(false);
  expect(button('print').disabled).toBe(false);
});

test('a report that fails to generate keeps Excel and Print locked but still lets the period be corrected', () => {
  mockQuery.mockReturnValue({
    loading: false,
    error: new Error('Cannot divide by zero in report IS, row 4'),
    refetch: jest.fn(),
  });
  render(<Page search={params} />);
  expect(screen.getByRole('alert').textContent).toContain(
    'Cannot divide by zero in report IS, row 4',
  );
  expect(button(/excel/).disabled).toBe(true);
  expect(button('print').disabled).toBe(true);
  expect(button('run').disabled).toBe(false);
});

test('running the same period again asks the server for fresh amounts instead of doing nothing', () => {
  const refetch = jest.fn();
  mockQuery.mockReturnValue({ ...generated, refetch });
  render(<Page search={params} />);
  fireEvent.click(button('run'));
  fireEvent.click(button('same period again'));
  expect(refetch).toHaveBeenCalledTimes(1);
  expect(mockQuery).toHaveBeenLastCalledWith(
    REPORT_GENERATE,
    expect.objectContaining({
      variables: {
        _id: 'r',
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        amountUnit: 'thousands',
        decimals: 0,
      },
    }),
  );
  fireEvent.click(button('run'));
  fireEvent.click(button('first half of 2025'));
  expect(refetch).toHaveBeenCalledTimes(1);
});

test('while the same period is being generated again the previous amounts stay on screen but cannot be exported or printed', () => {
  mockQuery.mockReturnValue({ ...generated, loading: true });
  render(<Page search={params} />);
  expect(mockQuery).toHaveBeenCalledWith(
    REPORT_GENERATE,
    expect.objectContaining({ notifyOnNetworkStatusChange: true }),
  );
  expect(screen.getByLabelText('generated cells').textContent).toContain(
    '"value":0',
  );
  expect(button(/excel/).disabled).toBe(true);
  expect(button('print').disabled).toBe(true);
  expect(button('run').disabled).toBe(false);
});
