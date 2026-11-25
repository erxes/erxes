import { ReactNode, ComponentProps } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TunableReportDetailPage } from '~/pages/TunableReportDetailPage';

const mockRemoveReport = jest.fn();
jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});
jest.mock('@apollo/client', () => ({
  useQuery: () => ({
    data: { accountingTunableReportDetail: { _id: 'r', version: 4 } },
    loading: false,
    refetch: jest.fn(),
  }),
}));
jest.mock('@/tunable-reports/useReports', () => ({
  useReportActions: () => ({
    canManage: false,
    canRemove: true,
    removing: false,
    removeReport: mockRemoveReport,
  }),
}));
jest.mock('@/tunable-reports/locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/layout/components/Layout', () => ({
  AccountingLayout: ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  ),
}));
jest.mock('@/layout/components/Header', () => ({
  AccountingHeader: ({ children }: { children?: ReactNode }) => (
    <header>{children}</header>
  ),
}));
jest.mock('@/tunable-reports/ReportEditor', () => ({
  ReportEditor: ({
    renderLayout,
  }: {
    renderLayout: (actions: ReactNode, body: ReactNode) => ReactNode;
  }) => renderLayout(<button type="submit">save</button>, <p>Editor</p>),
}));
jest.mock('@/tunable-reports/ReportPreview', () => ({
  ReportPreview: ({ organization }: { organization?: { name?: string } }) => (
    <>
      <p>Preview</p>
      <p>{organization?.name}</p>
    </>
  ),
}));
jest.mock('@/tunable-reports/ReportRunSheet', () => ({
  ReportRunSheet: () => null,
}));
jest.mock('@/journal-reports/hooks/useJournalReportOrganizationName', () => ({
  useJournalReportOrganizationName: () => ({
    organizationName: 'Алтай Тайга Тур ХХК',
    phoneNumber: '',
    email: '',
    loading: false,
  }),
}));
jest.mock('erxes-ui', () => ({
  Button: (props: ComponentProps<'button'>) => (
    <button type={props.type} disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  ),
  Spinner: () => <span />,
}));
const renderDetail = (mode: 'edit' | 'show') =>
  render(
    <MemoryRouter initialEntries={['/accounting/tunable-reports/r']}>
      <Routes>
        <Route
          path="/accounting/tunable-reports/:id"
          element={<TunableReportDetailPage mode={mode} />}
        />
        <Route
          path="/accounting/tunable-reports"
          element={<h1>Report list</h1>}
        />
      </Routes>
    </MemoryRouter>,
  );
afterEach(() => jest.clearAllMocks());

test.each(['show', 'edit'] as const)(
  'deletes directly from the %s header and returns to the list on success',
  async (mode) => {
    mockRemoveReport.mockResolvedValue(true);
    renderDetail(mode);
    fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    expect(
      await screen.findByRole('heading', { name: 'Report list' }),
    ).toBeTruthy();
    expect(mockRemoveReport).toHaveBeenCalledWith({ _id: 'r', version: 4 });
  },
);
test('the edit top bar holds the editor save action beside remove', () => {
  renderDetail('edit');
  const header = screen.getByRole('banner');
  expect(
    within(header)
      .getAllByRole('button')
      .map((button) => button.textContent),
  ).toEqual(['run', 'remove', 'save']);
});
test('keeps the detail open when deletion is cancelled or fails', async () => {
  mockRemoveReport.mockResolvedValue(false);
  renderDetail('show');
  fireEvent.click(screen.getByRole('button', { name: 'remove' }));
  await waitFor(() => expect(mockRemoveReport).toHaveBeenCalledTimes(1));
  expect(screen.getByText('Preview')).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Report list' })).toBeNull();
});
test('the saved report is shown with the company it will be printed for', () => {
  renderDetail('show');
  expect(screen.getByText('Preview')).toBeTruthy();
  expect(screen.getByText('Алтай Тайга Тур ХХК')).toBeTruthy();
});
