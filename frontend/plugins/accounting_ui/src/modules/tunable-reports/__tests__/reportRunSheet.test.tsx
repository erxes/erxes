import { ComponentProps, ReactNode } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { ReportRunSheet } from '../ReportRunSheet';

jest.mock('../locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('../fields', () => ({
  Choice: ({
    value,
    onChange,
    options,
  }: {
    value?: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  }) => (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const hookForm =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const dates = jest.requireActual<typeof import('date-fns')>('date-fns');
  const FieldName = react.createContext('');
  const plain = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const Message = () => {
    const name = react.useContext(FieldName);
    const { errors } = hookForm.useFormState();
    const message = errors[name]?.message;
    return message ? <p role="alert">{String(message)}</p> : null;
  };
  return {
    Button: ({ children, type, onClick }: ComponentProps<'button'>) => (
      <button type={type === 'submit' ? 'submit' : 'button'} onClick={onClick}>
        {children}
      </button>
    ),
    DatePicker: ({
      value,
      onChange,
    }: {
      value?: Date;
      onChange: (value?: Date) => void;
    }) => (
      <input
        type="date"
        value={value ? dates.format(value, 'yyyy-MM-dd') : ''}
        onChange={(event) =>
          onChange(
            event.target.value ? dates.parseISO(event.target.value) : undefined,
          )
        }
      />
    ),
    Input: react.forwardRef<HTMLInputElement, ComponentProps<'input'>>(
      (props, ref) => <input ref={ref} {...props} />,
    ),
    Form: Object.assign(hookForm.FormProvider, {
      Field: (props: ComponentProps<typeof hookForm.Controller>) => (
        <FieldName.Provider value={props.name}>
          <hookForm.Controller {...props} />
        </FieldName.Provider>
      ),
      Item: ({ children }: { children?: ReactNode }) => (
        <label>{children}</label>
      ),
      Label: ({ children }: { children?: ReactNode }) => (
        <span>{children}</span>
      ),
      Control: ({ children }: { children?: ReactNode }) => children,
      Message,
    }),
    Sheet: Object.assign(
      ({ open, children }: { open: boolean; children: ReactNode }) =>
        open ? <div role="dialog">{children}</div> : null,
      {
        View: plain,
        Header: plain,
        Content: plain,
        Description: plain,
        Footer: plain,
        Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
        Close: () => null,
      },
    ),
  };
});

const mockClose = jest.fn();
const field = (name: string) =>
  screen.getByLabelText<HTMLInputElement>(new RegExp(`^${name}`));
const submit = () =>
  fireEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'run' }),
  );
let open: jest.SpyInstance;
beforeEach(() => {
  open = jest.spyOn(window, 'open').mockImplementation(() => null);
});
afterEach(() => {
  open.mockRestore();
  jest.clearAllMocks();
});

test('on the print page the sheet starts from the period on screen and hands the changed one back without opening a tab', async () => {
  const onRun = jest.fn();
  render(
    <ReportRunSheet
      report={{ _id: 'ct1', name: 'Санхүүгийн байдлын тайлан' }}
      open
      onOpenChange={mockClose}
      defaultValues={{
        fromDate: '2026-01-01',
        toDate: '2026-12-31',
        amountUnit: 'thousands',
        decimals: 0,
      }}
      onRun={onRun}
    />,
  );
  expect(screen.getByText('Санхүүгийн байдлын тайлан')).toBeTruthy();
  expect(field('fromDate').value).toBe('2026-01-01');
  expect(field('toDate').value).toBe('2026-12-31');
  expect(field('decimals').value).toBe('0');
  fireEvent.change(field('toDate'), { target: { value: '2026-06-30' } });
  submit();
  await waitFor(() =>
    expect(onRun).toHaveBeenCalledWith({
      fromDate: '2026-01-01',
      toDate: '2026-06-30',
      amountUnit: 'thousands',
      decimals: 0,
    }),
  );
  expect(open).not.toHaveBeenCalled();
  expect(mockClose).toHaveBeenCalledWith(false);
});

test('from the report list it opens the report in a new tab for the current year', async () => {
  render(
    <ReportRunSheet
      report={{ _id: 'ct 1', name: 'Орлогын тайлан' }}
      open
      onOpenChange={mockClose}
    />,
  );
  const year = new Date().getFullYear();
  expect(field('fromDate').value).toBe(`${year}-01-01`);
  expect(field('toDate').value).toBe(`${year}-12-31`);
  submit();
  await waitFor(() =>
    expect(open).toHaveBeenCalledWith(
      `/accounting/tunable-reports/ct%201/print?fromDate=${year}-01-01&toDate=${year}-12-31&amountUnit=units&decimals=2&inPreview=true`,
      '_blank',
      'noopener,noreferrer',
    ),
  );
  expect(mockClose).toHaveBeenCalledWith(false);
});

test('an end date before the start date or too many decimals keeps the sheet open and runs nothing', async () => {
  const onRun = jest.fn();
  render(
    <ReportRunSheet
      report={{ _id: 'ct1', name: 'Орлогын тайлан' }}
      open
      onOpenChange={mockClose}
      defaultValues={{
        fromDate: '2026-07-01',
        toDate: '2026-12-31',
        amountUnit: 'units',
        decimals: 2,
      }}
      onRun={onRun}
    />,
  );
  fireEvent.change(field('toDate'), { target: { value: '2026-03-31' } });
  submit();
  expect((await screen.findByRole('alert')).textContent).toBe('dateError');
  fireEvent.change(field('toDate'), { target: { value: '2026-12-31' } });
  fireEvent.change(field('decimals'), { target: { value: '9' } });
  submit();
  await waitFor(() =>
    expect(
      within(field('decimals').closest('label') as HTMLElement).getByRole(
        'alert',
      ),
    ).toBeTruthy(),
  );
  expect(onRun).not.toHaveBeenCalled();
  expect(open).not.toHaveBeenCalled();
  expect(mockClose).not.toHaveBeenCalled();
});
