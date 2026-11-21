import { ComponentProps, ReactNode } from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FormulaReferenceFields } from '../FormulaReferenceFields';
import { ReportValues, reportFormSchema } from '../schema';
import { reportRow, tableMock } from './reportTestKit';

const queries: { list: unknown; detail: unknown; searches: string[] } = {
  list: {},
  detail: {},
  searches: [],
};
jest.mock('@/tunable-reports/graphql', () => ({
  REPORT_LIST: 'list',
  REPORT_DETAIL: 'detail',
}));
jest.mock('@apollo/client', () => ({
  useQuery: (
    document: string,
    options: { variables: { searchValue?: string }; skip?: boolean },
  ) => {
    if (document === 'list') {
      queries.searches.push(options.variables.searchValue ?? '');
      return queries.list;
    }
    return options.skip ? { loading: false } : queries.detail;
  },
}));
jest.mock('@/tunable-reports/locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const { tableMock: table } =
    jest.requireActual<typeof import('./reportTestKit')>('./reportTestKit');
  const plain = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  return {
    Table: table,
    Spinner: () => <span>loading</span>,
    TextOverflowTooltip: ({ value }: { value?: string }) => <span>{value}</span>,
    Form: Object.assign(
      ({ children }: { children?: ReactNode }) => <form>{children}</form>,
      {
        Field: Controller,
        Item: plain,
        Message: () => null,
      },
    ),
    PopoverScoped: ({
      scope,
      children,
    }: {
      scope: string;
      children: ReactNode;
    }) => (
      <div role="group" aria-label={scope}>
        {children}
      </div>
    ),
    RecordTableInlineCell: {
      Trigger: ({ children, ...props }: ComponentProps<'button'>) => (
        <button type="button" aria-label={props['aria-label']}>
          {children}
        </button>
      ),
      Content: plain,
    },
    Combobox: { Check: () => null },
    Command: Object.assign(
      ({ children }: { children?: ReactNode }) => <div>{children}</div>,
      {
        Input: ({
          value,
          placeholder,
          onValueChange,
        }: {
          value?: string;
          placeholder?: string;
          onValueChange?: (value: string) => void;
        }) => (
          <input
            value={value ?? ''}
            placeholder={placeholder}
            onChange={(event) => onValueChange?.(event.target.value)}
          />
        ),
        List: plain,
        Empty: plain,
        Item: ({
          children,
          onSelect,
        }: {
          children: ReactNode;
          onSelect: () => void;
        }) => (
          <button
            type="button"
            role="option"
            aria-selected={false}
            onClick={onSelect}
          >
            {children}
          </button>
        ),
      },
    ),
  };
});

const otherReport = {
  _id: 'bs2',
  code: 'BS2',
  name: 'Balance 2',
  sections: [
    {
      _id: 'assets',
      name: 'Assets',
      formulaType: 'row',
      rows: [reportRow('total', 'Total assets', { number: '1' })],
      columns: [{ _id: 'closing', name: 'Closing' }],
    },
    {
      _id: 'notes',
      name: 'Notes by cell',
      formulaType: 'cell',
      rows: [],
      columns: [],
    },
  ],
};
const path = 'sections.0.formulas.0.source';
const picker = (field: string) =>
  within(screen.getByRole('group', { name: `${path}.${field}` }));
const draft = () =>
  JSON.parse(screen.getByLabelText('draft').textContent || '{}');

const Table = tableMock;
const Harness = () => {
  const form = useForm<ReportValues>({
    defaultValues: reportFormSchema.parse({
      code: 'BS1',
      name: 'Balance 1',
      sections: [
        {
          _id: 'own',
          formulaType: 'row',
          columns: [{ _id: 'c', name: 'Closing', getDate: 'last' }],
          rows: [
            reportRow('cash', 'Cash', { number: '1.1' }),
            reportRow('stock', 'Inventory', { number: '1.2' }),
          ],
          formulas: [
            {
              _id: 'f',
              rowId: 'cash',
              kind: 'from_row',
              percent: '100',
              source: { rowId: 'cash' },
            },
          ],
        },
      ],
    }),
  });
  return (
    <>
      <Table>
        <Table.Body>
          <Table.Row>
            <FormulaReferenceFields
              form={form}
              sectionIndex={0}
              formulaIndex={0}
              operand="source"
              reportId="bs1"
            />
          </Table.Row>
        </Table.Body>
      </Table>
      <output aria-label="draft">
        {JSON.stringify(form.watch(path) ?? {})}
      </output>
    </>
  );
};

beforeEach(() => {
  queries.searches = [];
  queries.list = {
    loading: false,
    data: {
      accountingTunableReports: {
        list: [{ _id: 'bs1', code: 'BS1', name: 'Balance 1' }, otherReport],
      },
    },
  };
  queries.detail = {
    loading: false,
    data: { accountingTunableReportDetail: otherReport },
  };
});

test('an accountant picks a row of this report, then switches to another report section by section', async () => {
  render(<Harness />);
  expect(picker('reportId').getByLabelText('sourceReport').textContent).toBe(
    'sameReport',
  );
  expect(
    picker('reportId').queryByRole('option', { name: 'BS1 Balance 1' }),
  ).toBeNull();
  fireEvent.click(
    picker('rowId').getByRole('option', { name: '1.2 Inventory' }),
  );
  expect(draft()).toEqual({ rowId: 'stock' });

  fireEvent.click(
    picker('reportId').getByRole('option', { name: 'BS2 Balance 2' }),
  );
  expect(draft()).toEqual({ reportId: 'bs2', rowId: '' });
  expect(picker('reportId').getByLabelText('sourceReport').textContent).toBe(
    'BS2 Balance 2',
  );
  expect(
    picker('sectionId')
      .getAllByRole('option')
      .map((option) => option.textContent),
  ).toEqual(['Assets']);

  fireEvent.click(picker('sectionId').getByRole('option', { name: 'Assets' }));
  fireEvent.click(
    picker('rowId').getByRole('option', { name: '1 Total assets' }),
  );
  fireEvent.click(picker('columnId').getByRole('option', { name: 'Closing' }));
  expect(draft()).toEqual({
    reportId: 'bs2',
    sectionId: 'assets',
    rowId: 'total',
    columnId: 'closing',
  });

  fireEvent.click(
    picker('reportId').getByRole('option', { name: 'sameReport' }),
  );
  expect(draft()).toEqual({ rowId: '' });
  expect(
    picker('rowId')
      .getAllByRole('option')
      .map((option) => option.textContent),
  ).toEqual(['1.1 Cash', '1.2 Inventory']);
});

test('report search is sent to the server and failures stay visible next to the choices', async () => {
  queries.list = { loading: false, error: new Error('Network down') };
  render(<Harness />);
  expect(picker('reportId').getByRole('alert').textContent).toBe(
    'Network down',
  );
  expect(picker('reportId').getAllByRole('option')).toHaveLength(1);

  fireEvent.change(picker('reportId').getByPlaceholderText('search'), {
    target: { value: 'zzz-missing' },
  });
  await waitFor(() => expect(queries.searches).toContain('zzz-missing'));
  expect(picker('rowId').queryByRole('alert')).toBeNull();
});
