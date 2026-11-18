import { ComponentProps, ReactNode } from 'react';
import {
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { SectionEditor } from '../SectionEditor';
import { newReport } from '../values';
import { ReportValues, reportSectionInputSchema } from '../schema';

jest.mock('@/tunable-reports/locales', () => ({
  useReportTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/utils/graphqlMutation', () => ({
  notifyMutationResult: jest.fn(),
}));
jest.mock('@/tunable-reports/FormulaEditor', () => ({
  FormulaCellEditor: ({
    target,
  }: {
    target: { rowId: string; columnId: string };
  }) => (
    <output aria-label="formula target">
      {target.rowId}:{target.columnId}
    </output>
  ),
}));
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  useSensor: jest.fn(),
  useSensors: () => [],
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
}));
jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: ReactNode }) => children,
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: jest.fn() }),
  sortableKeyboardCoordinates: jest.fn(),
  horizontalListSortingStrategy: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
}));
jest.mock('erxes-ui', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const { Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const plain = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const element = (tag: 'table' | 'thead' | 'tbody' | 'tr' | 'th' | 'td') =>
    react.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
      (props, ref) => react.createElement(tag, { ...props, ref }),
    );
  return {
    Button: (props: ComponentProps<'button'>) => (
      <button
        type={props.type}
        disabled={props.disabled}
        onClick={props.onClick}
        aria-label={props['aria-label']}
      >
        {props.children}
      </button>
    ),
    DragHandle: (props: ComponentProps<'button'>) => <button {...props} />,
    Input: react.forwardRef<HTMLInputElement, ComponentProps<'input'>>(
      (props, ref) => <input {...props} ref={ref} />,
    ),
    Textarea: react.forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(
      (props, ref) => <textarea {...props} ref={ref} />,
    ),
    Checkbox: ({
      checked,
      onCheckedChange,
    }: {
      checked: boolean;
      onCheckedChange: (value: boolean) => void;
    }) => (
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
    ),
    Form: Object.assign(plain, {
      Field: Controller,
      Item: plain,
      Label: ({ children }: { children: ReactNode }) => <span>{children}</span>,
      Control: plain,
      Message: () => null,
    }),
    Select: Object.assign(plain, {
      Trigger: plain,
      Value: () => null,
      Content: plain,
      Item: plain,
    }),
    Table: Object.assign(element('table'), {
      Header: element('thead'),
      Body: element('tbody'),
      Row: element('tr'),
      Head: element('th'),
      Cell: element('td'),
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
    useConfirm: () => ({ confirm: jest.fn().mockResolvedValue(true) }),
  };
});
const mockInspect = jest.fn();
const Harness = ({ initial }: { initial?: ReportValues }) => {
  const form = useForm<ReportValues>({
    defaultValues: initial || newReport('Demo'),
  });
  return (
    <>
      <SectionEditor form={form} index={0} />
      <button onClick={() => mockInspect(form.getValues())}>inspect</button>
    </>
  );
};

test('adds columns from the section header and rows below the matrix', () => {
  render(<Harness />);
  const table = screen.getByRole('table');
  expect(within(table).queryByRole('button', { name: 'addColumn' })).toBeNull();
  expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
  fireEvent.click(screen.getByRole('button', { name: 'addColumn' }));
  expect(within(table).getAllByRole('columnheader')).toHaveLength(4);
  expect(within(table).getByPlaceholderText('name').getAttribute('value')).toBe(
    '',
  );
  fireEvent.change(within(table).getByPlaceholderText('name'), {
    target: { value: 'Closing' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'addRow' }));
  const inputs = within(table).getAllByPlaceholderText('name');
  fireEvent.change(inputs[inputs.length - 1], { target: { value: 'Cash' } });
  fireEvent.click(
    screen.getByRole('button', { name: 'configureFormula · Cash · rowScope' }),
  );
  expect(
    within(screen.getByRole('dialog')).getByLabelText('formula target')
      .textContent,
  ).toContain(':');
});

test('row settings open in a sheet and keep edits when it closes', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'addRow' }));
  fireEvent.click(screen.getByRole('button', { name: 'rowSettings ·' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByPlaceholderText('name'), {
    target: { value: 'Cash' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'done' }));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByDisplayValue('Cash')).toBeTruthy();
});

test('section name starts blank and switches between text and input on blur and edit', () => {
  render(<Harness />);
  expect(screen.queryByPlaceholderText('section')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'section: edit' }));
  const input = screen.getByPlaceholderText('section');
  expect(input.getAttribute('value')).toBe('');
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: 'Notes' } });
  fireEvent.blur(input);
  expect(screen.queryByPlaceholderText('section')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Notes' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'section: edit' }));
  fireEvent.change(screen.getByPlaceholderText('section'), {
    target: { value: '' },
  });
  fireEvent.blur(screen.getByPlaceholderText('section'));
  expect(screen.queryByPlaceholderText('section')).toBeNull();
  expect(screen.getByRole('button', { name: 'section: edit' })).toBeTruthy();
});

test.each([
  ['row', 0],
  ['row', 1],
  ['column', 0],
  ['column', 1],
] as const)(
  'deleting %s at index %s removes it completely and leaves other items editable',
  async (kind, position) => {
    render(<Harness />);
    const add = kind === 'row' ? 'addRow' : 'addColumn';
    const settings = kind === 'row' ? 'rowSettings ·' : 'columnSettings ·';
    fireEvent.click(screen.getByRole('button', { name: add }));
    fireEvent.click(screen.getByRole('button', { name: add }));
    const buttons = screen.getAllByRole('button', { name: settings });
    fireEvent.click(buttons[position]);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'remove',
      }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: settings })).toHaveLength(1),
    );
    fireEvent.click(screen.getByRole('button', { name: 'inspect' }));
    expect(mockInspect).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sections: expect.arrayContaining([
          expect.objectContaining({
            [kind === 'row' ? 'rows' : 'columns']: [
              expect.objectContaining({ isActive: true }),
            ],
          }),
        ]),
      }),
    );
    expect(document.querySelector('tr.opacity-50')).toBeNull();
    expect(document.querySelector('th .opacity-50')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: add }));
    expect(screen.getAllByRole('button', { name: settings })).toHaveLength(2);
  },
);

test('the grid has no empty data row and adding rows remains an action outside the table', () => {
  render(<Harness />);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('row')).toHaveLength(1);
  expect(within(table).queryByRole('button', { name: 'addRow' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'addRow' }));
  expect(within(table).getAllByRole('row')).toHaveLength(2);
});

test('row indent and typography update the number and name inputs immediately', () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole('button', { name: 'addRow' }));
  fireEvent.click(screen.getByRole('button', { name: 'rowSettings ·' }));
  const dialog = screen.getByRole('dialog');
  fireEvent.change(within(dialog).getByPlaceholderText('indent'), {
    target: { value: '2' },
  });
  const toggles = within(dialog).getAllByRole('checkbox');
  toggles.slice(0, 3).forEach((toggle) => fireEvent.click(toggle));
  const table = screen.getByRole('table');
  const number = within(table).getByPlaceholderText('number');
  const name = within(table).getByPlaceholderText('name');
  for (const input of [number, name]) {
    expect(input.className).toContain('font-bold');
    expect(input.className).toMatch(/\bitalic\b/);
    expect(input.className).toMatch(/\bunderline\b/);
  }
  expect(table.querySelector('span.whitespace-pre')?.textContent).toBe(
    ' '.repeat(8),
  );
  toggles.slice(0, 3).forEach((toggle) => fireEvent.click(toggle));
  fireEvent.change(within(dialog).getByPlaceholderText('indent'), {
    target: { value: '0' },
  });
  expect(name.className).toContain('font-normal');
  expect(name.className).toContain('not-italic');
  expect(name.className).toContain('no-underline');
  expect(table.querySelector('span.whitespace-pre')?.textContent).toBe('');
});

test.each(['row', 'cell'] as const)(
  '%s formula scope renders the correct cell spans and configured term counts',
  (scope) => {
    const initial = newReport('Demo');
    initial.sections[0] = reportSectionInputSchema.parse({
      ...initial.sections[0],
      formulaType: scope,
      columns: [
        { _id: 'c1', name: 'Opening', getDate: 'first' },
        { _id: 'c2', name: 'Closing', getDate: 'last' },
      ],
      rows: [{ _id: 'r', name: 'Cash' }],
      formulas: ['f1', 'f2'].map((_id) => ({
        _id,
        rowId: 'r',
        columnId: scope === 'cell' ? 'c1' : undefined,
        kind: 'balance',
      })),
    });
    render(<Harness initial={initial} />);
    const actions = screen.getAllByRole('button', { name: /configureFormula/ });
    expect(actions).toHaveLength(scope === 'row' ? 1 : 2);
    expect(actions[0].textContent).toBe('2');
    expect(actions[0].closest('td')?.getAttribute('colspan')).toBe(
      scope === 'row' ? '2' : '1',
    );
    expect(actions[0].querySelector('.tabler-icon-code')).toBeTruthy();
    if (scope === 'cell') expect(actions[1].textContent).toBe('0');
    fireEvent.click(actions[0]);
    expect(
      within(screen.getByRole('dialog')).getByLabelText('formula target')
        .textContent,
    ).toBe('r:c1');
  },
);

const RemovableSections = () => {
  const initial = newReport('Demo');
  initial.sections.push({ ...initial.sections[0], _id: 'second' });
  const form = useForm<ReportValues>({ defaultValues: initial });
  const sections = useFieldArray({ control: form.control, name: 'sections' });
  return (
    <>
      {sections.fields.map((section, index) => (
        <SectionEditor
          key={section._id}
          form={form}
          index={index}
          onRemove={
            sections.fields.length > 1
              ? () => sections.remove(index)
              : undefined
          }
        />
      ))}
    </>
  );
};

test('section headers expose removal until only the final section remains', () => {
  render(<RemovableSections />);
  expect(
    screen.getAllByRole('button', { name: 'remove · section' }),
  ).toHaveLength(2);
  fireEvent.click(
    screen.getAllByRole('button', { name: 'remove · section' })[0],
  );
  expect(screen.getAllByRole('table')).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'remove · section' })).toBeNull();
});
