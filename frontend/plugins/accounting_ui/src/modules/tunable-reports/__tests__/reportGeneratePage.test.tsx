import { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
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
    loading: false,
  }),
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
