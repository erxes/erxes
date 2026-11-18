import { ComponentProps } from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { ReportTransferField } from '../ReportTransferField';
import {
  formatReportTransfer,
  parseReportTransfer,
  reportToTransfer,
  transferToReport,
} from '../reportTransfer';
import { reportFormSchema, ReportValues } from '../schema';
import { useReportTransfer } from '../useReportTransfer';

jest.mock('../locales', () => ({
  useReportTranslation: () => ({
    t: (key: string, values?: Record<string, string>) =>
      values ? `${key}:${Object.values(values).join('|')}` : key,
  }),
}));
jest.mock('../useReportTransfer', () => ({ useReportTransfer: jest.fn() }));
const mockNotify = jest.fn();
jest.mock('@/utils/graphqlMutation', () => ({
  notifyMutationResult: (...args: unknown[]) => mockNotify(...args),
}));
jest.mock('erxes-ui', () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: ComponentProps<'button'> & { variant?: string }) => (
    <button type="button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
  Label: ({ children, htmlFor }: ComponentProps<'label'>) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  Spinner: () => null,
  Textarea: (props: ComponentProps<'textarea'>) => <textarea {...props} />,
}));

const report = (): ReportValues =>
  reportFormSchema.parse({
    code: 'СТ4',
    name: 'Cash flow',
    sections: [
      {
        _id: 's',
        columns: [{ _id: 'c', name: 'Period', getDate: 'between' }],
        rows: [{ _id: 'r', name: 'Cash' }, { _id: 'copy' }],
        formulas: [
          {
            _id: 'f',
            rowId: 'r',
            kind: 'transaction',
            debitAccountId: 'acc-1',
            creditAccountCategoryId: 'cat-1',
            valueSide: 'debit',
          },
          {
            _id: 'g',
            rowId: 'copy',
            kind: 'from_row',
            source: { reportId: 'other-id', sectionId: 's1', rowId: 'x' },
          },
          {
            _id: 'h',
            rowId: 'copy',
            kind: 'from_row',
            source: { reportId: 'self-id', rowId: 'r' },
          },
        ],
      },
    ],
  });
const byId = {
  accounts: new Map([['acc-1', '100101']]),
  categories: new Map([['cat-1', '10']]),
  reports: new Map([['other-id', 'СТ1']]),
};
const byCode = {
  accounts: new Map([['100101', 'acc-9']]),
  categories: new Map([['10', 'cat-9']]),
  reports: new Map([['СТ1', 'other-9']]),
};

test('report JSON carries codes and round-trips into another tenant', () => {
  const { value, missing } = reportToTransfer(report(), byId, 'self-id');
  expect(missing).toEqual([]);
  const [f, g, h] = value.sections[0].formulas;
  expect(f).toMatchObject({
    debitAccountCode: '100101',
    creditAccountCategoryCode: '10',
  });
  expect(f).not.toHaveProperty('debitAccountId');
  expect(g.source).toEqual({ reportCode: 'СТ1', sectionId: 's1', rowId: 'x' });
  // Own-report references stay relative so they follow the pasted report.
  expect(
    JSON.parse(formatReportTransfer(value)).sections[0].formulas[2],
  ).toEqual(expect.objectContaining({ source: { rowId: 'r' } }));
  expect(h.source?.reportCode).toBeUndefined();

  const parsed = parseReportTransfer(formatReportTransfer(value));
  if (!parsed.success) throw new Error(parsed.error);
  const applied = transferToReport(parsed.data, byCode);
  expect(applied.missing).toEqual([]);
  expect(applied.value.sections[0].formulas[0]).toMatchObject({
    debitAccountId: 'acc-9',
    creditAccountCategoryId: 'cat-9',
  });
  expect(applied.value.sections[0].formulas[1].source?.reportId).toBe(
    'other-9',
  );
  expect(
    applied.value.sections[0].formulas[2].source?.reportId,
  ).toBeUndefined();
  expect(reportFormSchema.safeParse(applied.value).success).toBe(true);
});

test('lists every code missing in the target tenant and unknown ids', () => {
  const { value } = reportToTransfer(report(), byId, 'self-id');
  expect(
    transferToReport(value, {
      accounts: new Map(),
      categories: new Map(),
      reports: new Map(),
    }).missing,
  ).toEqual(['account 100101', 'category 10', 'report СТ1']);
  expect(
    reportToTransfer(report(), {
      ...byId,
      accounts: new Map(),
    }).missing,
  ).toEqual(['account acc-1', 'report self-id']);
});

test('accepts a converted file with one report and rejects invalid JSON', () => {
  const { value } = reportToTransfer(report(), byId, 'self-id');
  expect(
    parseReportTransfer(JSON.stringify({ reports: [value] })).success,
  ).toBe(true);
  expect(
    parseReportTransfer(JSON.stringify({ reports: [value, value] })),
  ).toEqual({ success: false, error: 'Paste exactly one report' });
  expect(parseReportTransfer('{').success).toBe(false);
  const invalid = parseReportTransfer(JSON.stringify({ code: 'X' }));
  expect(invalid.success).toBe(false);
});

const Editor = ({ onValues }: { onValues: (values: ReportValues) => void }) => {
  const form = useForm<ReportValues>({ defaultValues: report() });
  onValues(form.watch());
  return <ReportTransferField form={form} currentReportId="self-id" canApply />;
};

test('fills from state, copies, and applies pasted JSON into the editor', async () => {
  const transferred = reportToTransfer(report(), byId, 'self-id');
  const pasted = {
    ...transferred.value,
    name: 'Pasted',
  };
  const applied = transferToReport(pasted, byCode);
  const fill = jest.fn().mockResolvedValue(transferred);
  const apply = jest.fn().mockResolvedValue(applied);
  jest
    .mocked(useReportTransfer)
    .mockReturnValue({ loading: false, fill, apply });
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.assign(navigator, { clipboard: { writeText } });
  let latest = report();
  render(<Editor onValues={(values) => (latest = values)} />);
  const area = screen.getByLabelText<HTMLTextAreaElement>('reportJson');
  expect(area.value).toBe('');

  await act(async () => fireEvent.click(screen.getByText('fillFromReport')));
  expect(fill).toHaveBeenCalledWith(
    expect.objectContaining({ code: 'СТ4' }),
    'self-id',
  );
  expect(area.value).toBe(formatReportTransfer(transferred.value));

  await act(async () => fireEvent.click(screen.getByText('copy')));
  expect(writeText).toHaveBeenCalledWith(area.value);
  expect(screen.getByText('copied')).toBeTruthy();

  fireEvent.change(area, { target: { value: formatReportTransfer(pasted) } });
  await act(async () => fireEvent.click(screen.getByText('applyJson')));
  await waitFor(() => expect(latest.name).toBe('Pasted'));
  expect(latest.sections[0].formulas[0].debitAccountId).toBe('acc-9');
  expect(mockNotify).toHaveBeenCalledWith(true, 'jsonApplied');
});

test('does not apply JSON with unknown codes and explains why', async () => {
  const transferred = reportToTransfer(report(), byId, 'self-id');
  jest.mocked(useReportTransfer).mockReturnValue({
    loading: false,
    fill: jest.fn(),
    apply: jest
      .fn()
      .mockResolvedValue({ value: report(), missing: ['account 100101'] }),
  });
  let latest = report();
  render(<Editor onValues={(values) => (latest = values)} />);
  const area = screen.getByLabelText('reportJson');
  fireEvent.change(area, {
    target: {
      value: formatReportTransfer({ ...transferred.value, name: 'X' }),
    },
  });
  await act(async () => fireEvent.click(screen.getByText('applyJson')));
  expect(screen.getByRole('alert').textContent).toBe(
    'jsonMissing:account 100101',
  );
  expect(latest.name).toBe('Cash flow');
  fireEvent.change(area, { target: { value: '{' } });
  await act(async () => fireEvent.click(screen.getByText('applyJson')));
  expect(screen.getByRole('alert').textContent).toMatch(/^jsonInvalid:/);
});
