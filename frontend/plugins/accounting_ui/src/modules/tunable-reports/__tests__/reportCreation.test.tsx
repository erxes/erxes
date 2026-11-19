import { ReactNode, ComponentProps } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { TunableReportsPage } from '~/pages/TunableReportsPage';
import { ReportEditor } from '../ReportEditor';

jest.mock('react-router', () => {
  const { TextDecoder, TextEncoder } =
    jest.requireActual<typeof import('util')>('util');
  Object.assign(globalThis, { TextDecoder, TextEncoder });
  return jest.requireActual('react-router');
});
const mockReports: {
  _id: string;
  name: string;
  code: string;
  status?: string;
}[] = [];
jest.mock('@apollo/client', () => ({
  useQuery: () => ({
    data: {
      accountingTunableReports: {
        list: mockReports,
        totalCount: mockReports.length,
      },
    },
    loading: false,
    refetch: jest.fn(),
  }),
}));
jest.mock('@/tunable-reports/useReports', () => ({
  useReportActions: () => ({
    canManage: false,
    canRemove: false,
    saving: false,
    removing: false,
    saveReport: jest.fn(),
    removeReport: jest.fn(),
  }),
}));
jest.mock('@/tunable-reports/locales', () => ({
  useReportTranslation: () => ({
    t: (key: string) => (key === 'add' ? 'Add report' : key),
  }),
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
jest.mock('@/layout/components/AccountingEmptyState', () => ({
  AccountingEmptyState: () => null,
}));
jest.mock('@/tunable-reports/ReportRunSheet', () => ({
  ReportRunSheet: ({ report }: { report: { name: string } }) => (
    <div role="dialog">{report.name}</div>
  ),
}));
jest.mock('@/tunable-reports/SectionEditor', () => ({
  SectionEditor: () => null,
}));
jest.mock('@/tunable-reports/SortableTable', () => ({
  SortableSections: () => null,
}));
jest.mock('@/tunable-reports/ReportSettingsSheet', () => ({
  ReportSettingsSheet: () => null,
}));
jest.mock('@/tunable-reports/ReportPreviewSheet', () => ({
  ReportPreviewSheet: ({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) =>
    open ? (
      <div role="dialog">
        draft preview
        <button onClick={() => onOpenChange(false)}>close preview</button>
      </div>
    ) : null,
}));
jest.mock('@/tunable-reports/ReportIdentityField', () => ({
  ReportIdentityField: () => null,
}));
jest.mock('@/tunable-reports/fields', () => ({
  TextSetting: () => null,
  TextareaSetting: () => null,
  ChoiceSetting: () => null,
}));
jest.mock('@/utils/graphqlMutation', () => ({
  notifyMutationResult: jest.fn(),
}));
jest.mock('erxes-ui', () => {
  const { cloneElement, isValidElement } =
    jest.requireActual<typeof import('react')>('react');
  const Block = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Card: Object.assign(Block, { Header: Block, Title: Block, Footer: Block }),
    Badge: Block,
    Button: ({
      asChild,
      children,
      disabled,
      type,
      form,
      onClick,
    }: ComponentProps<'button'> & { asChild?: boolean }) =>
      asChild ? (
        isValidElement(children) ? (
          cloneElement(children)
        ) : null
      ) : (
        <button disabled={disabled} type={type} form={form} onClick={onClick}>
          {children}
        </button>
      ),
    Input: (props: ComponentProps<'input'>) => <input {...props} />,
    Form: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Spinner: () => <span />,
    useConfirm: () => ({ confirm: jest.fn() }),
  };
});
const Location = () => (
  <output aria-label="location">{useLocation().pathname}</output>
);

test('Add remains available and opens the create route without cached manage permission', () => {
  render(
    <MemoryRouter initialEntries={['/accounting/tunable-reports']}>
      <TunableReportsPage />
      <Location />
    </MemoryRouter>,
  );
  fireEvent.click(
    within(screen.getByRole('banner')).getByRole('link', {
      name: 'Add report',
    }),
  );
  expect(screen.getByLabelText('location').textContent).toBe(
    '/accounting/tunable-reports/new',
  );
});

test('an unsaved report can be edited and submitted before client permission metadata is updated', () => {
  const { container } = render(
    <MemoryRouter>
      <ReportEditor />
    </MemoryRouter>,
  );
  expect(container.querySelector('fieldset')?.disabled).toBe(false);
  const save = screen.getByRole('button', { name: 'save' });
  expect(save.getAttribute('type')).toBe('submit');
  // Save may sit outside the form (the page top bar) and still submits it.
  expect(save.getAttribute('form')).toBe(container.querySelector('form')?.id);
});

test('reports render as cards and Generate opens the selected report sheet', () => {
  mockReports.push({ _id: 'r', code: '01', name: 'Balance report' });
  render(
    <MemoryRouter>
      <TunableReportsPage />
    </MemoryRouter>,
  );
  expect(screen.queryByRole('table')).toBeNull();
  expect(screen.getByText('Balance report')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'run' }));
  expect(screen.getByRole('dialog').textContent).toBe('Balance report');
  mockReports.length = 0;
});

test('Preview opens from the editor for a report that was never saved and closes again', () => {
  render(
    <MemoryRouter>
      <ReportEditor />
    </MemoryRouter>,
  );
  expect(screen.queryByRole('dialog')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'preview' }));
  expect(screen.getByRole('dialog').textContent).toContain('draft preview');
  fireEvent.click(screen.getByRole('button', { name: 'close preview' }));
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('only archived reports carry the archived mark in the list', () => {
  mockReports.push(
    { _id: 'a', code: 'СТ1', name: 'Санхүүгийн байдал', status: 'active' },
    { _id: 'b', code: 'ТТ-02', name: 'ААНОАТ 2024', status: 'archived' },
  );
  render(
    <MemoryRouter>
      <TunableReportsPage />
    </MemoryRouter>,
  );
  const card = (name: string) =>
    screen.getByText(name).parentElement?.parentElement as HTMLElement;
  expect(within(card('ААНОАТ 2024')).getByText('archived')).toBeTruthy();
  expect(within(card('Санхүүгийн байдал')).queryByText('archived')).toBeNull();
  expect(screen.getAllByText('archived')).toHaveLength(1);
  mockReports.length = 0;
});
