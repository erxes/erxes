import { ComponentProps, ReactNode } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FormulaCellEditor } from '../FormulaEditor';
import { ReportValues, reportFormSchema } from '../schema';

// Field-array structure can update a render before the section watcher.
jest.mock('react-hook-form', () => {
  const actual =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  return {
    ...actual,
    useWatch: (options: Parameters<typeof actual.useWatch>[0]) => {
      const value: unknown = actual.useWatch(options);
      if (options?.name === 'sections.0' && value && typeof value === 'object')
        return { ...value, formulas: [] };
      return value;
    },
  };
});
jest.mock('@/tunable-reports/locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: { InlineCell: () => <span>Account selector</span> },
}));
jest.mock(
  '@/settings/account/account-categories/components/SelectAccountCategory',
  () => ({ SelectAccountCategory: () => <span>Category selector</span> }),
);
jest.mock('@/tunable-reports/ReferenceSelect', () => ({
  ReferenceSelect: ({ label }: { label: string }) => <span>{label}</span>,
}));
jest.mock('@apollo/client', () => ({ useQuery: () => ({ loading: false }) }));
jest.mock('erxes-ui', () => {
  const { forwardRef, createContext, useContext } =
    jest.requireActual<typeof import('react')>('react');
  const tabContext = createContext<{
    value: string;
    onValueChange: (value: string) => void;
  } | null>(null);
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const plain = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Button: (props: ComponentProps<'button'>) => (
      <button
        type={props.type}
        onClick={props.onClick}
        aria-label={props['aria-label']}
      >
        {props.children}
      </button>
    ),
    Input: forwardRef<HTMLInputElement, ComponentProps<'input'>>(
      (props, ref) => <input {...props} ref={ref} />,
    ),
    Spinner: () => null,
    Tabs: Object.assign(
      ({
        value,
        onValueChange,
        children,
      }: {
        value: string;
        onValueChange: (value: string) => void;
        children: ReactNode;
      }) => (
        <tabContext.Provider value={{ value, onValueChange }}>
          {children}
        </tabContext.Provider>
      ),
      {
        List: ({ children }: { children: ReactNode }) => (
          <div role="tablist">{children}</div>
        ),
        Trigger: ({
          value,
          children,
        }: {
          value: string;
          children: ReactNode;
        }) => {
          const context = useContext(tabContext);
          return (
            <button
              type="button"
              role="tab"
              aria-selected={context?.value === value}
              onClick={() => context?.onValueChange(value)}
            >
              {children}
            </button>
          );
        },
        Content: ({
          value,
          children,
        }: {
          value: string;
          children: ReactNode;
        }) =>
          useContext(tabContext)?.value === value ? (
            <div role="tabpanel">{children}</div>
          ) : null,
      },
    ),
    Table: Object.assign(
      ({ children }: { children: ReactNode }) => <table>{children}</table>,
      {
        Header: ({ children }: { children: ReactNode }) => (
          <thead>{children}</thead>
        ),
        Body: ({ children }: { children: ReactNode }) => (
          <tbody>{children}</tbody>
        ),
        Row: ({ children }: { children: ReactNode }) => <tr>{children}</tr>,
        Head: ({ children }: { children: ReactNode }) => <th>{children}</th>,
        Cell: ({ children }: { children: ReactNode }) => <td>{children}</td>,
      },
    ),
    Form: Object.assign(plain, {
      Field: Controller,
      Control: plain,
      Item: plain,
      Label: plain,
      Message: () => null,
    }),
    Select: Object.assign(plain, {
      Trigger: plain,
      Value: () => null,
      Content: plain,
      Item: plain,
    }),
  };
});
const Harness = ({ scope }: { scope: 'row' | 'cell' }) => {
  const form = useForm<ReportValues>({
    defaultValues: reportFormSchema.parse({
      code: 'R',
      name: 'Report',
      sections: [
        {
          _id: 's',
          formulaType: scope,
          columns: [{ _id: 'c', name: 'Closing', getDate: 'last' }],
          rows: [{ _id: 'r', name: 'Cash' }],
          formulas: [],
        },
      ],
    }),
  });
  return (
    <>
      <FormulaCellEditor
        form={form}
        sectionIndex={0}
        target={{ rowId: 'r', columnId: 'c' }}
      />
      <button
        type="button"
        onClick={() =>
          form.setValue(
            'description',
            JSON.stringify(form.getValues('sections.0.formulas')),
          )
        }
      >
        Inspect saved draft
      </button>
      <output aria-label="draft">{form.watch('description')}</output>
    </>
  );
};
test.each(['row', 'cell'] as const)(
  'adding, removing and adding a %s formula tolerates stale section snapshots',
  async (scope) => {
    render(<Harness scope={scope} />);
    fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
    await waitFor(() =>
      expect(screen.getAllByText('Account selector')).toHaveLength(1),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Inspect saved draft' }),
    );
    expect(screen.getByLabelText('draft').textContent).toContain('"rowId":"r"');
    if (scope === 'cell')
      expect(screen.getByLabelText('draft').textContent).toContain(
        '"columnId":"c"',
      );
    expect(
      within(screen.getAllByRole('row')[1])
        .getAllByRole('cell')[0]
        .querySelector('button')
        ?.getAttribute('aria-label'),
    ).toBe('remove');
    fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    expect(screen.getByText('noFormulas')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
    await waitFor(() =>
      expect(screen.getAllByText('Account selector')).toHaveLength(1),
    );
  },
);

test('tabs count only their terms and preserve inline edits while adding and deleting across types', async () => {
  render(<Harness scope="cell" />);
  expect(screen.getByRole('tab', { name: 'balance (0)' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
  expect(screen.getByRole('tab', { name: 'balance (1)' })).toBeTruthy();
  fireEvent.change(screen.getByPlaceholderText('percent'), {
    target: { value: '25' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'transaction (0)' }));
  fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
  expect(screen.getByRole('tab', { name: 'transaction (1)' })).toBeTruthy();
  expect(screen.getAllByText('Account selector')).toHaveLength(2);
  expect(screen.getAllByText('Category selector')).toHaveLength(2);
  fireEvent.click(screen.getByRole('tab', { name: 'balance (1)' }));
  expect(
    (screen.getByPlaceholderText('percent') as HTMLInputElement).value,
  ).toBe('25');
  fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
  expect(screen.getByRole('tab', { name: 'balance (2)' })).toBeTruthy();
  fireEvent.click(
    within(screen.getAllByRole('row')[1]).getByRole('button', {
      name: 'remove',
    }),
  );
  expect(screen.getByRole('tab', { name: 'balance (1)' })).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'transaction (1)' }));
  fireEvent.click(screen.getByRole('button', { name: 'Inspect saved draft' }));
  const draft = screen.getByLabelText('draft').textContent || '';
  expect(draft).toContain('"kind":"transaction"');
  expect(draft).toContain('"kind":"balance"');
  fireEvent.click(screen.getByRole('tab', { name: 'from_row (0)' }));
  fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
  expect(screen.getByRole('tab', { name: 'from_row (1)' })).toBeTruthy();
  expect(screen.getByRole('columnheader', { name: 'source' })).toBeTruthy();
  fireEvent.click(screen.getByRole('tab', { name: 'ratio (0)' }));
  fireEvent.click(screen.getByRole('button', { name: 'addFormula' }));
  expect(screen.getByRole('tab', { name: 'ratio (1)' })).toBeTruthy();
  expect(
    screen.getByRole('columnheader', { name: 'ratioSource' }),
  ).toBeTruthy();
});
