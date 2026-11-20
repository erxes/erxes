import { ComponentProps } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { ReportPreviewSheet } from '../ReportPreviewSheet';
import { newColumn, newReport } from '../values';
import { reportRow } from './reportTestKit';
import { ReportValues } from '../schema';

const mockClose = jest.fn();
const mockOrganization = jest.fn();
jest.mock('../locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/journal-reports/hooks/useJournalReportOrganizationName', () => ({
  useJournalReportOrganizationName: () => mockOrganization(),
}));
jest.mock('erxes-ui', () => {
  const kit =
    jest.requireActual<typeof import('./reportTestKit')>('./reportTestKit');
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    Button: ({ children, onClick }: ComponentProps<'button'>) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    Table: kit.tableMock,
    Sheet: kit.sheetMock,
  };
});

const draft = (): ReportValues => {
  const report = newReport('Мөнгөн гүйлгээний тайлан');
  report.header = '<p>{name}, утас {phone1}</p>';
  report.sections[0].columns = [{ ...newColumn('Тайлант үе'), _id: 'c' }];
  report.sections[0].rows = [
    { ...reportRow('r', 'Үндсэн үйл ажиллагааны мөнгөн гүйлгээ'), number: '1' },
  ];
  return report;
};
const Editor = ({ open = true }: { open?: boolean }) => {
  const form = useForm<ReportValues>({ defaultValues: draft() });
  return (
    <>
      <input aria-label="report name" {...form.register('name')} />
      <input
        aria-label="row name"
        {...form.register('sections.0.rows.0.name')}
      />
      <ReportPreviewSheet form={form} open={open} onOpenChange={mockClose} />
    </>
  );
};
beforeEach(() =>
  mockOrganization.mockReturnValue({
    organizationName: 'Алтай Тайга Тур ХХК',
    phoneNumber: '+976 9911 2233',
    email: '',
    loading: false,
  }),
);
afterEach(() => jest.clearAllMocks());

test('the preview shows the draft exactly as typed, before anything is saved', () => {
  render(<Editor />);
  const preview = within(screen.getByRole('dialog'));
  expect(
    preview.getByRole('heading', { name: 'Мөнгөн гүйлгээний тайлан' }),
  ).toBeTruthy();
  expect(
    preview.getByText('Алтай Тайга Тур ХХК, утас +976 9911 2233'),
  ).toBeTruthy();
  fireEvent.change(screen.getByLabelText('report name'), {
    target: { value: 'Мөнгөн гүйлгээний тайлан (шууд арга)' },
  });
  fireEvent.change(screen.getByLabelText('row name'), {
    target: { value: 'Бараа борлуулсны орлого' },
  });
  expect(
    preview.getByRole('heading', {
      name: 'Мөнгөн гүйлгээний тайлан (шууд арга)',
    }),
  ).toBeTruthy();
  const cellsOfRow = within(
    preview.getByText('Бараа борлуулсны орлого').closest('tr') as HTMLElement,
  ).getAllByRole('cell');
  expect(cellsOfRow[2].textContent).toBe('');
  expect(preview.getByText('previewHint')).toBeTruthy();
});

test('closing the preview hands control back to the editor and a closed preview renders nothing', () => {
  const { unmount } = render(<Editor />);
  fireEvent.click(screen.getByRole('button', { name: 'done' }));
  expect(mockClose).toHaveBeenCalledWith(false);
  unmount();
  render(<Editor open={false} />);
  expect(screen.queryByRole('dialog')).toBeNull();
});

test('company placeholders stay as typed while the organization is still loading', () => {
  mockOrganization.mockReturnValue({
    organizationName: '',
    phoneNumber: '',
    email: '',
    loading: true,
  });
  render(<Editor />);
  expect(
    within(screen.getByRole('dialog')).getByText('{name}, утас {phone1}'),
  ).toBeTruthy();
});
