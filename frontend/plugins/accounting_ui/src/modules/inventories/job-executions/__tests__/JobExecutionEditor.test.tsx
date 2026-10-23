import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useMutation } from '@apollo/client';
import type { ReactElement, ReactNode } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { usePermissionCheck } from 'ui-modules';
import { toast, useConfirm } from 'erxes-ui';
import { SAVE_EXECUTION, UNDO_EXECUTION } from '../graphql';
import { TJobForm } from '@/settings/jobs/types/Job';
import { JobExecutionEditor } from '../JobExecutionEditor';
import { JobExecution } from '../types';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(),
  useApolloClient: () => ({ refetchQueries: jest.fn().mockResolvedValue([]) }),
}));
jest.mock('erxes-ui', () => {
  const { FormProvider, Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const { Fragment, createContext, useContext, cloneElement } =
    jest.requireActual<typeof import('react')>('react');
  const SheetContext = createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>({
    open: false,
    onOpenChange: () => undefined,
  });
  const SheetRoot = ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <SheetContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
  return {
    cn: (...classes: string[]) => classes.join(' '),
    Form: Object.assign(FormProvider, {
      Field: Controller,
      Item: 'div',
      Label: 'label',
      Control: Fragment,
      Message: () => null,
    }),
    Input: 'input',
    DatePicker: ({
      value,
      onChange,
      disabled,
    }: {
      value?: Date;
      onChange: (date: Date | null) => void;
      disabled?: boolean;
    }) => (
      <input
        aria-label="date"
        disabled={disabled}
        value={value?.toISOString() ?? ''}
        onChange={(event) =>
          onChange(event.target.value ? new Date(event.target.value) : null)
        }
      />
    ),
    Separator: 'hr',
    Table: Object.assign(
      ({ children }: { children: ReactNode }) => <table>{children}</table>,
      {
        Header: 'thead',
        Body: 'tbody',
        Row: 'tr',
        Cell: 'td',
        Head: 'th',
      },
    ),
    RecordTable: { MoreButton: 'button' },
    Button: 'button',
    Textarea: 'textarea',
    Sheet: Object.assign(SheetRoot, {
      Trigger: ({ children }: { children: ReactElement }) => {
        const { onOpenChange } = useContext(SheetContext);
        return cloneElement(children as ReactElement<{ onClick: () => void }>, {
          onClick: () => onOpenChange(true),
        });
      },
      View: ({ children }: { children: ReactNode }) =>
        useContext(SheetContext).open ? (
          <div role="dialog">{children}</div>
        ) : null,
      Content: 'div',
      Header: 'div',
      Title: 'h2',
      Footer: 'div',
      Close: ({ children }: { children: ReactNode }) => children,
    }),
    Spinner: () => null,
    toast: jest.fn(),
    useConfirm: jest.fn(() => ({
      confirm: jest.fn().mockResolvedValue(undefined),
    })),
  };
});
jest.mock('ui-modules', () => ({
  SelectBranches: { FormItem: () => null },
  SelectDepartments: { FormItem: () => null },
  usePermissionCheck: jest.fn(),
}));
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: {
    FormItem: ({
      onValueChange,
      defaultFilter,
    }: {
      onValueChange: (value: string) => void;
      defaultFilter: {
        journals: string[];
        status: string;
        permissionMode: string;
      };
    }) => (
      <button
        type="button"
        data-filter={JSON.stringify(defaultFilter)}
        onClick={() => onValueChange('inventory-account')}
      >
        Choose account
      </button>
    ),
  },
}));
jest.mock('../SelectExecutionJob', () => ({
  SelectExecutionJob: ({ onChange }: { onChange: (value: object) => void }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          _id: 'card',
          name: 'Assembly',
          inputs: [{ productId: 'raw', quantity: 2 }],
          outputs: [{ productId: 'finished', quantity: 1, costRatio: 1 }],
          laborCosts: [{ name: 'Work', amount: 10, accountId: 'labor' }],
        })
      }
    >
      Choose card
    </button>
  ),
}));
jest.mock('@/settings/jobs/components/JobForm', () => ({
  JobForm: ({
    form,
    header,
    onSubmit,
    readOnly,
  }: {
    form: UseFormReturn<TJobForm>;
    header: ReactNode;
    onSubmit: (values: TJobForm) => void;
    readOnly: boolean;
  }) => (
    <fieldset disabled={readOnly}>
      {header}
      <button type="button" onClick={() => onSubmit(form.getValues())}>
        Save actuals
      </button>
      <button
        type="button"
        onClick={() => form.setValue('inputs.0.quantity', 7)}
      >
        Change actual input
      </button>
    </fieldset>
  ),
}));

test('requires execution metadata and saves copied actual arrays with separate inventory accounts', async () => {
  const save = jest.fn();
  jest.mocked(useMutation).mockReturnValue([save, { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  render(<JobExecutionEditor onSaved={jest.fn()} />);
  const accountSelectors = screen.getAllByText('Choose account');
  expect(accountSelectors).toHaveLength(2);
  for (const selector of accountSelectors) {
    expect(selector.getAttribute('data-filter')).toBe(
      JSON.stringify({
        journals: ['inventory'],
        status: 'active',
        permissionMode: 'write',
      }),
    );
  }
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(save).not.toHaveBeenCalled());
  fireEvent.click(screen.getByText('Choose card'));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '2' } });
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
  screen
    .getAllByText('Choose account')
    .forEach((button) => fireEvent.click(button));
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      variables: {
        _id: undefined,
        input: expect.objectContaining({
          inputAccountId: 'inventory-account',
          outputAccountId: 'inventory-account',
          jobs: [
            expect.objectContaining({
              jobId: 'card',
              quantity: 3,
              inputs: [{ productId: 'raw', uom: '', quantity: 6 }],
              outputs: [
                { productId: 'finished', uom: '', quantity: 3, costRatio: 1 },
              ],
              laborCosts: [{ name: 'Work', accountId: 'labor', amount: 30 }],
              overheadCosts: [],
            }),
          ],
        }),
      },
    }),
  );
});

test('read-only users cannot submit or change execution fields', () => {
  jest
    .mocked(useMutation)
    .mockReturnValue([jest.fn(), { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => false } as never);
  render(<JobExecutionEditor onSaved={jest.fn()} />);
  fireEvent.click(screen.getByLabelText('production-job 1'));
  expect(screen.getByText('Save actuals').closest('fieldset')?.disabled).toBe(
    true,
  );
});

test('adds multiple jobs, scales each independently and removes only the selected row', async () => {
  const save = jest.fn();
  jest.mocked(useMutation).mockReturnValue([save, { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  render(<JobExecutionEditor onSaved={jest.fn()} />);
  fireEvent.click(screen.getByText('Choose card'));
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '5' } });
  fireEvent.click(screen.getByText('production-add-job'));
  fireEvent.click(screen.getAllByText('Choose card')[1]);
  fireEvent.change(screen.getAllByRole('spinbutton')[1], {
    target: { value: '10' },
  });
  screen
    .getAllByText('Choose account')
    .forEach((button) => fireEvent.click(button));
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][0].variables.input.jobs).toEqual([
    expect.objectContaining({
      jobId: 'card',
      quantity: 5,
      inputs: [{ productId: 'raw', uom: '', quantity: 10 }],
    }),
    expect.objectContaining({
      jobId: 'card',
      quantity: 10,
      inputs: [{ productId: 'raw', uom: '', quantity: 20 }],
    }),
  ]);
  fireEvent.click(screen.getAllByLabelText('production-remove-job')[0]);
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
  expect(save.mock.calls[1][0].variables.input.jobs).toEqual([
    expect.objectContaining({
      quantity: 10,
      inputs: [{ productId: 'raw', uom: '', quantity: 20 }],
    }),
  ]);
});

const postedExecution: JobExecution = {
  _id: 'execution',
  date: '2026-10-21T03:04:05.678Z',
  status: 'posted',
  parentId: 'parent',
  ptrId: 'ptr',
  error: null,
  description: null,
  inputAccountId: 'inventory-account',
  inputBranchId: null,
  inputDepartmentId: null,
  outputAccountId: 'inventory-account',
  outputBranchId: null,
  outputDepartmentId: null,
  jobs: [
    {
      _id: 'row',
      jobId: 'card',
      jobName: 'Assembly',
      quantity: 2,
      inputs: [{ productId: 'raw', uom: 'ea', quantity: 4, costRatio: null }],
      outputs: [
        { productId: 'finished', uom: 'ea', quantity: 2, costRatio: 1 },
      ],
      laborCosts: [],
      overheadCosts: [],
    },
  ],
};

test('posted execution actuals remain editable and save through the existing execution id', async () => {
  const save = jest.fn();
  jest.mocked(useMutation).mockReturnValue([save, { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  const execution = postedExecution;
  render(<JobExecutionEditor execution={execution} onSaved={jest.fn()} />);
  expect(
    screen.getByRole('button', { name: 'save & production-post' }),
  ).toBeTruthy();
  fireEvent.click(screen.getByLabelText('production-job 1'));
  expect(screen.getByText('Save actuals').closest('fieldset')?.disabled).toBe(
    false,
  );
  fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
  fireEvent.click(
    screen.getByRole('button', { name: 'save & production-post', exact: true }),
  );
  await waitFor(() =>
    expect(save).toHaveBeenCalledWith({
      variables: {
        _id: 'execution',
        input: expect.objectContaining({
          date: new Date(execution.date),
          jobs: [
            expect.objectContaining({
              _id: 'row',
              jobId: 'card',
              quantity: 3,
              inputs: [{ productId: 'raw', uom: 'ea', quantity: 6 }],
              outputs: [
                { productId: 'finished', uom: 'ea', quantity: 3, costRatio: 1 },
              ],
            }),
          ],
        }),
      },
    }),
  );
});

test('the shared date picker updates the form date and rejects an empty required date', async () => {
  const save = jest.fn();
  jest.mocked(useMutation).mockReturnValue([save, { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  render(<JobExecutionEditor onSaved={jest.fn()} />);
  expect(document.querySelector('input[type="datetime-local"]')).toBeNull();
  fireEvent.click(screen.getByText('Choose card'));
  screen
    .getAllByText('Choose account')
    .forEach((button) => fireEvent.click(button));
  const date = '2026-10-25T00:00:00.000Z';
  fireEvent.change(screen.getByLabelText('date'), { target: { value: date } });
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][0].variables.input.date).toEqual(new Date(date));
  fireEvent.change(screen.getByLabelText('date'), { target: { value: '' } });
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
});

test('row details stay hidden until opened and persist after closing and reopening', async () => {
  const save = jest.fn();
  jest.mocked(useMutation).mockReturnValue([save, { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  render(<JobExecutionEditor onSaved={jest.fn()} />);
  expect(screen.queryByText('Save actuals')).toBeNull();
  fireEvent.click(screen.getByText('Choose card'));
  fireEvent.click(screen.getByLabelText('production-job 1'));
  fireEvent.click(screen.getByText('Change actual input'));
  fireEvent.click(screen.getByText('close'));
  await waitFor(() => expect(screen.queryByText('Save actuals')).toBeNull());
  fireEvent.click(screen.getByLabelText('production-job 1'));
  expect(screen.getByText('Save actuals')).toBeTruthy();
  fireEvent.click(screen.getByText('close'));
  await waitFor(() => expect(screen.queryByText('Save actuals')).toBeNull());
  screen
    .getAllByText('Choose account')
    .forEach((button) => fireEvent.click(button));
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0][0].variables.input.jobs[0].inputs[0].quantity).toBe(
    7,
  );
});

test('saving an invalid unopened job opens its details without submitting', async () => {
  const save = jest.fn();
  jest.mocked(useMutation).mockReturnValue([save, { loading: false }] as never);
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  render(<JobExecutionEditor onSaved={jest.fn()} />);
  expect(screen.queryByText('Save actuals')).toBeNull();
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(screen.getByText('Save actuals')).toBeTruthy());
  expect(save).not.toHaveBeenCalled();
});

const setupSaveActions = (execution?: JobExecution) => {
  const save = jest.fn().mockResolvedValue({
    data: {
      jobExecutionSave: {
        _id: 'saved-execution',
        status: 'draft',
        parentId: null,
      },
    },
  });
  const post = jest.fn().mockResolvedValue({
    data: {
      jobExecutionPost: {
        _id: 'saved-execution',
        status: 'posted',
        parentId: 'parent',
      },
    },
  });
  const onSaved = jest.fn();
  const undo = jest.fn().mockResolvedValue({
    data: { jobExecutionUndo: { _id: execution?._id, status: 'draft' } },
  });
  jest
    .mocked(useMutation)
    .mockImplementation(
      (document) =>
        [
          document === SAVE_EXECUTION
            ? save
            : document === UNDO_EXECUTION
            ? undo
            : post,
          { loading: false },
        ] as never,
    );
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
  render(<JobExecutionEditor execution={execution} onSaved={onSaved} />);
  fireEvent.click(screen.getByText('Choose card'));
  screen
    .getAllByText('Choose account')
    .forEach((button) => fireEvent.click(button));
  return { save, post, undo, onSaved };
};

test.each([false, true])(
  'posted edit supports draft-save and transaction-save: %s',
  async (createTransactions) => {
    const { save, post, undo, onSaved } = setupSaveActions(postedExecution);
    save.mockResolvedValue({
      data: {
        jobExecutionSave: {
          _id: postedExecution._id,
          status: 'posted',
          parentId: 'parent',
        },
      },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: createTransactions
          ? 'save & production-post'
          : 'save-with-draft-status',
        exact: true,
      }),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ _id: postedExecution._id }),
      }),
    );
    expect(post).not.toHaveBeenCalled();
    if (createTransactions) expect(undo).not.toHaveBeenCalled();
    else {
      expect(undo).toHaveBeenCalledWith({
        variables: { _id: postedExecution._id },
      });
      expect(save.mock.invocationCallOrder[0]).toBeLessThan(
        undo.mock.invocationCallOrder[0],
      );
    }
  },
);

test('quantity edits, blur, Enter and incidental form submits do not persist until a save button is clicked', async () => {
  const { save, post, undo, onSaved } = setupSaveActions();
  const quantity = screen.getByRole('spinbutton');
  const draftButton = screen.getByRole('button', {
    name: 'save-with-draft-status',
    exact: true,
  });
  const form = draftButton.closest('form');
  expect(form).not.toBeNull();
  await act(async () => {
    fireEvent.change(quantity, { target: { value: '5' } });
    fireEvent.blur(quantity);
    fireEvent.keyDown(quantity, { key: 'Enter', code: 'Enter' });
    if (form) fireEvent.submit(form);
  });
  expect(save).not.toHaveBeenCalled();
  expect(post).not.toHaveBeenCalled();
  expect(undo).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
  fireEvent.click(draftButton);
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({
      variables: expect.objectContaining({
        input: expect.objectContaining({
          jobs: [expect.objectContaining({ quantity: 5 })],
        }),
      }),
    }),
  );
});

test('cancelling posted draft-save leaves journals and actuals untouched', async () => {
  const confirm = jest.fn().mockRejectedValue(new Error('Cancelled'));
  jest.mocked(useConfirm).mockReturnValueOnce({ confirm } as never);
  const { save, post, undo } = setupSaveActions(postedExecution);
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() => expect(confirm).toHaveBeenCalled());
  expect(save).not.toHaveBeenCalled();
  expect(post).not.toHaveBeenCalled();
  expect(undo).not.toHaveBeenCalled();
});

test('failed posted draft-save does not undo existing transactions', async () => {
  const { save, undo, post, onSaved } = setupSaveActions(postedExecution);
  save.mockRejectedValue(new Error('Actuals validation failed'));
  fireEvent.click(
    screen.getByRole('button', { name: 'save-with-draft-status', exact: true }),
  );
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Actuals validation failed',
        variant: 'destructive',
      }),
    ),
  );
  expect(undo).not.toHaveBeenCalled();
  expect(post).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test.each([false, true])(
  'save action creates transactions only when requested: %s',
  async (createTransactions) => {
    const { save, post, onSaved } = setupSaveActions();
    fireEvent.click(
      screen.getByRole('button', {
        name: createTransactions
          ? 'save & production-post'
          : 'save-with-draft-status',
        exact: true,
      }),
    );
    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledTimes(1);
    if (createTransactions) {
      expect(post).toHaveBeenCalledWith({
        variables: { _id: 'saved-execution' },
      });
      expect(save.mock.invocationCallOrder[0]).toBeLessThan(
        post.mock.invocationCallOrder[0],
      );
    } else expect(post).not.toHaveBeenCalled();
  },
);

test('failed saves never create transactions or close the unsaved form', async () => {
  const { save, post, onSaved } = setupSaveActions();
  save.mockRejectedValue(new Error('Save failed'));
  fireEvent.click(
    screen.getByRole('button', { name: 'save & production-post', exact: true }),
  );
  await waitFor(() =>
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Save failed',
        variant: 'destructive',
      }),
    ),
  );
  expect(post).not.toHaveBeenCalled();
  expect(onSaved).not.toHaveBeenCalled();
});

test('post failure preserves the saved record and returns to the list instead of allowing duplicate creation', async () => {
  const { save, post, onSaved } = setupSaveActions();
  post.mockRejectedValue(new Error('Insufficient inventory'));
  fireEvent.click(
    screen.getByRole('button', { name: 'save & production-post', exact: true }),
  );
  await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  expect(save).toHaveBeenCalledTimes(1);
  expect(post).toHaveBeenCalledWith({ variables: { _id: 'saved-execution' } });
  expect(toast).toHaveBeenCalledWith(
    expect.objectContaining({
      description: 'Insufficient inventory',
      variant: 'destructive',
    }),
  );
});
