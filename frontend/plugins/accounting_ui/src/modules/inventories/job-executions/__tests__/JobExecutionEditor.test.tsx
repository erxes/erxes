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
import { toast } from 'erxes-ui';
import {
  SAVE_EXECUTION,
  UNDO_EXECUTION,
} from '@/inventories/job-executions/graphql';
import { TJobForm } from '@/settings/jobs/types/Job';
import { JOB_EXECUTION_PANEL } from '@/inventories/job-executions/JobExecutionEditor';
import { JobExecution } from '@/inventories/job-executions/types';

const mockClosePanel = jest.fn();
const mockCancelDraft = jest.fn();
const mockRefetchQueries = jest.fn();
const mockConfirm = jest.fn();
let mockDetail: JobExecution | undefined;
let mockDetailLoading = false;
let mockDetailError: Error | undefined;

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@apollo/client', () => ({
  useMutation: jest.fn(),
  useApolloClient: () => ({ refetchQueries: mockRefetchQueries }),
}));
jest.mock('erxes-ui', () => {
  const { FormProvider, Controller } =
    jest.requireActual<typeof import('react-hook-form')>('react-hook-form');
  const { Fragment, createContext, useContext, cloneElement } =
    jest.requireActual<typeof import('react')>('react');
  const CollapsibleContext = createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>({ open: false, onOpenChange: () => undefined });
  const CollapsibleRoot = ({
    children,
    open,
    onOpenChange,
  }: {
    children: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <CollapsibleContext.Provider value={{ open, onOpenChange }}>
      <div>{children}</div>
    </CollapsibleContext.Provider>
  );
  return {
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
    Button: 'button',
    Tooltip: Object.assign(
      ({ children }: { children: ReactNode }) => children,
      {
        Trigger: ({ children }: { children: ReactNode }) => children,
        Content: () => null,
      },
    ),
    Collapsible: Object.assign(CollapsibleRoot, {
      Trigger: ({ children }: { children: ReactElement }) => {
        const { open, onOpenChange } = useContext(CollapsibleContext);
        return cloneElement(children as ReactElement<{ onClick: () => void }>, {
          onClick: () => onOpenChange(!open),
        });
      },
      TriggerIcon: () => null,
      Content: ({ children }: { children: ReactNode }) =>
        useContext(CollapsibleContext).open ? (
          <div role="region">{children}</div>
        ) : null,
    }),
    Spinner: () => <span>loading</span>,
    toast: jest.fn(),
    useConfirm: () => ({ confirm: mockConfirm }),
  };
});
jest.mock('ui-modules', () => ({
  PANEL_INPUT_CLASS_NAME: '',
  PanelFormRow: ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: ReactNode;
  }) => (
    <div>
      <span>{label}</span>
      {children}
      {error && <span role="alert">{error}</span>}
    </div>
  ),
  SelectBranches: { InlineCell: () => null },
  SelectDepartments: { InlineCell: () => null },
  usePermissionCheck: jest.fn(),
}));
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: ({
    onValueChange,
    defaultFilter,
  }: {
    onValueChange: (value: string) => void;
    defaultFilter: Record<string, unknown>;
  }) => (
    <button
      type="button"
      data-filter={JSON.stringify(defaultFilter)}
      onClick={() => onValueChange('inventory-account')}
    >
      Choose account
    </button>
  ),
}));
jest.mock('@/settings/components/panel/SettingsPanelActions', () => ({
  SettingsPanelAddButton: () => null,
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: () => ({
    closePanel: mockClosePanel,
    cancelDraft: mockCancelDraft,
  }),
}));
jest.mock('@/inventories/job-executions/useJobExecutionDetail', () => ({
  useJobExecutionDetail: () => ({
    execution: mockDetail,
    loading: mockDetailLoading,
    error: mockDetailError,
  }),
}));
jest.mock('@/layout/components/AccountingEmptyState', () => ({
  AccountingEmptyState: ({ error }: { error?: Error }) => (
    <div role="status">{error ? error.message : 'no-results-found'}</div>
  ),
}));
jest.mock('@/inventories/job-executions/SelectExecutionJob', () => ({
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
    readOnly,
  }: {
    form: UseFormReturn<TJobForm>;
    readOnly: boolean;
  }) => (
    <fieldset disabled={readOnly}>
      <span>Job actuals</span>
      <button
        type="button"
        onClick={() => form.setValue('inputs.0.quantity', 7)}
      >
        Change actual input
      </button>
    </fieldset>
  ),
}));

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

const allowManage = (allowed = true) =>
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => allowed } as never);

const mockMutations = () => {
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
  const undo = jest.fn().mockResolvedValue({
    data: { jobExecutionUndo: { _id: 'execution', status: 'draft' } },
  });
  jest.mocked(useMutation).mockImplementation((document) => {
    let mutate = post;
    if (document === SAVE_EXECUTION) mutate = save;
    else if (document === UNDO_EXECUTION) mutate = undo;
    return [mutate, { loading: false }] as never;
  });
  return { save, post, undo };
};

const openNew = () => {
  const { New } = JOB_EXECUTION_PANEL;
  if (!New) throw new Error('Job execution panel has no New view');
  render(<New contentType="accounting:jobExecution" contentId="new" />);
};

const openSaved = (contentId = 'execution') => {
  const { Detail } = JOB_EXECUTION_PANEL;
  render(
    <Detail contentType="accounting:jobExecution" contentId={contentId} />,
  );
};

const chooseCardAndAccounts = () => {
  fireEvent.click(screen.getByText('Choose card'));
  screen
    .getAllByText('Choose account')
    .forEach((button) => fireEvent.click(button));
};

const clickButton = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }));

beforeEach(() => {
  jest.clearAllMocks();
  mockRefetchQueries.mockResolvedValue([]);
  mockConfirm.mockResolvedValue(undefined);
  mockDetail = postedExecution;
  mockDetailLoading = false;
  mockDetailError = undefined;
  allowManage();
});

describe('new execution in the side panel', () => {
  test('accountant fills a new execution, saves it as draft, and the panel closes with the list refreshed', async () => {
    const { save, post } = mockMutations();
    openNew();
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
    fireEvent.click(screen.getByText('Choose card'));
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '3' },
    });
    accountSelectors.forEach((button) => fireEvent.click(button));
    clickButton('save-with-draft-status');
    await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
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
    });
    expect(post).not.toHaveBeenCalled();
    expect(mockRefetchQueries).toHaveBeenCalledWith({
      include: ['AccountingJobExecutions', 'AccountingJobExecutionDetail'],
    });
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'production-saved',
        variant: 'success',
      }),
    );
  });

  test('saving an empty execution flags both inventory accounts and keeps the panel open', async () => {
    const { save } = mockMutations();
    openNew();
    clickButton('save-with-draft-status');
    await waitFor(() => expect(screen.getAllByRole('alert')).toHaveLength(2));
    expect(
      screen.getAllByRole('alert').map((alert) => alert.textContent),
    ).toEqual(['production-required', 'production-required']);
    expect(save).not.toHaveBeenCalled();
    expect(mockClosePanel).not.toHaveBeenCalled();
  });

  test('a job row left without a card opens its details and nothing is sent', async () => {
    const { save } = mockMutations();
    openNew();
    expect(screen.queryByText('Job actuals')).toBeNull();
    screen
      .getAllByText('Choose account')
      .forEach((button) => fireEvent.click(button));
    clickButton('save-with-draft-status');
    await waitFor(() => expect(screen.getByText('Job actuals')).toBeTruthy());
    expect(save).not.toHaveBeenCalled();
  });

  test('the date picker updates the date and an emptied date is refused', async () => {
    const { save } = mockMutations();
    openNew();
    chooseCardAndAccounts();
    const date = '2026-10-25T00:00:00.000Z';
    fireEvent.change(screen.getByLabelText('date'), {
      target: { value: date },
    });
    clickButton('save-with-draft-status');
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0].variables.input.date).toEqual(new Date(date));
    fireEvent.change(screen.getByLabelText('date'), { target: { value: '' } });
    clickButton('save-with-draft-status');
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe('production-required'),
    );
    expect(save).toHaveBeenCalledTimes(1);
  });

  test('adds two jobs, scales each one on its own and removes only the chosen row', async () => {
    const { save } = mockMutations();
    openNew();
    fireEvent.click(screen.getByText('Choose card'));
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByText('production-add-job'));
    fireEvent.click(screen.getAllByText('Choose card')[1]);
    fireEvent.change(screen.getAllByRole('spinbutton')[1], {
      target: { value: '10' },
    });
    screen
      .getAllByText('Choose account')
      .forEach((button) => fireEvent.click(button));
    clickButton('save-with-draft-status');
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
    clickButton('save-with-draft-status');
    await waitFor(() => expect(save).toHaveBeenCalledTimes(2));
    expect(save.mock.calls[1][0].variables.input.jobs).toEqual([
      expect.objectContaining({
        quantity: 10,
        inputs: [{ productId: 'raw', uom: '', quantity: 20 }],
      }),
    ]);
  });

  test('job actuals expand inside the panel and keep their edits after collapsing', async () => {
    const { save } = mockMutations();
    openNew();
    expect(screen.queryByText('Job actuals')).toBeNull();
    fireEvent.click(screen.getByText('Choose card'));
    fireEvent.click(screen.getByLabelText('production-job 1'));
    fireEvent.click(screen.getByText('Change actual input'));
    fireEvent.click(screen.getByLabelText('production-job 1'));
    await waitFor(() => expect(screen.queryByText('Job actuals')).toBeNull());
    fireEvent.click(screen.getByLabelText('production-job 1'));
    expect(screen.getByText('Job actuals')).toBeTruthy();
    screen
      .getAllByText('Choose account')
      .forEach((button) => fireEvent.click(button));
    clickButton('save-with-draft-status');
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
    expect(
      save.mock.calls[0][0].variables.input.jobs[0].inputs[0].quantity,
    ).toBe(7);
  });

  test('quantity edits, Enter and incidental submits do not save until a save button is clicked', async () => {
    const { save, post } = mockMutations();
    openNew();
    chooseCardAndAccounts();
    const quantity = screen.getByRole('spinbutton');
    const form = quantity.closest('form');
    expect(form).not.toBeNull();
    await act(async () => {
      fireEvent.change(quantity, { target: { value: '5' } });
      fireEvent.blur(quantity);
      fireEvent.keyDown(quantity, { key: 'Enter', code: 'Enter' });
      if (form) fireEvent.submit(form);
    });
    expect(save).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
    expect(mockClosePanel).not.toHaveBeenCalled();
    clickButton('save-with-draft-status');
    await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
    expect(save.mock.calls[0][0].variables.input.jobs).toEqual([
      expect.objectContaining({ quantity: 5 }),
    ]);
  });

  test.each([false, true])(
    'transactions are created only when save & post is chosen: %s',
    async (createTransactions) => {
      const { save, post } = mockMutations();
      openNew();
      chooseCardAndAccounts();
      clickButton(
        createTransactions
          ? 'save & production-post'
          : 'save-with-draft-status',
      );
      await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
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

  test('a failed save shows the server error and keeps the unsaved panel open', async () => {
    const { save, post } = mockMutations();
    save.mockRejectedValue(new Error('Save failed'));
    openNew();
    chooseCardAndAccounts();
    clickButton('save & production-post');
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Save failed',
          variant: 'destructive',
        }),
      ),
    );
    expect(post).not.toHaveBeenCalled();
    expect(mockClosePanel).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: 'save & production-post' }),
    ).toBeTruthy();
  });

  test('a posting failure after a successful save closes the panel so the execution is not created twice', async () => {
    const { save, post } = mockMutations();
    post.mockRejectedValue(new Error('Insufficient inventory'));
    openNew();
    chooseCardAndAccounts();
    clickButton('save & production-post');
    await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Insufficient inventory',
        variant: 'destructive',
      }),
    );
  });

  test('cancel discards the draft without saving', () => {
    const { save } = mockMutations();
    openNew();
    chooseCardAndAccounts();
    clickButton('cancel');
    expect(mockCancelDraft).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });

  test('a user without manage permission sees locked fields and no save buttons', () => {
    mockMutations();
    allowManage(false);
    openNew();
    fireEvent.click(screen.getByLabelText('production-job 1'));
    expect(screen.getByText('Job actuals').closest('fieldset')?.disabled).toBe(
      true,
    );
    expect(
      screen.queryByRole('button', { name: 'save-with-draft-status' }),
    ).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'save & production-post' }),
    ).toBeNull();
  });
});

describe('saved execution opened from the list', () => {
  test('opens the clicked execution with its saved job and saves edits through its id', async () => {
    const { save } = mockMutations();
    openSaved();
    const quantity = screen.getByRole('spinbutton') as HTMLInputElement;
    expect(quantity.value).toBe('2');
    fireEvent.click(screen.getByLabelText('production-job 1'));
    expect(screen.getByText('Job actuals').closest('fieldset')?.disabled).toBe(
      false,
    );
    fireEvent.change(quantity, { target: { value: '3' } });
    clickButton('save & production-post');
    await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
    expect(save).toHaveBeenCalledWith({
      variables: {
        _id: 'execution',
        input: expect.objectContaining({
          date: new Date(postedExecution.date),
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
    });
  });

  test.each([false, true])(
    'a posted execution saved as draft is undone, saved with post is not: post=%s',
    async (createTransactions) => {
      const { save, post, undo } = mockMutations();
      save.mockResolvedValue({
        data: {
          jobExecutionSave: {
            _id: 'execution',
            status: 'posted',
            parentId: 'parent',
          },
        },
      });
      openSaved();
      clickButton(
        createTransactions
          ? 'save & production-post'
          : 'save-with-draft-status',
      );
      await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
      expect(post).not.toHaveBeenCalled();
      if (createTransactions) expect(undo).not.toHaveBeenCalled();
      else {
        expect(undo).toHaveBeenCalledWith({ variables: { _id: 'execution' } });
        expect(save.mock.invocationCallOrder[0]).toBeLessThan(
          undo.mock.invocationCallOrder[0],
        );
      }
    },
  );

  test('declining the undo confirmation keeps the posted execution and lets the user save again', async () => {
    mockConfirm.mockReturnValueOnce(new Promise<void>(() => undefined));
    const { save, post, undo } = mockMutations();
    save.mockResolvedValue({
      data: {
        jobExecutionSave: {
          _id: 'execution',
          status: 'posted',
          parentId: null,
        },
      },
    });
    openSaved();
    clickButton('save-with-draft-status');
    await waitFor(() => expect(mockConfirm).toHaveBeenCalledTimes(1));
    expect(save).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
    expect(undo).not.toHaveBeenCalled();
    expect(mockClosePanel).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(
        (
          screen.getByRole('button', {
            name: 'save-with-draft-status',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false),
    );
    clickButton('save-with-draft-status');
    await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
    expect(mockConfirm).toHaveBeenCalledTimes(2);
    expect(undo).toHaveBeenCalledWith({ variables: { _id: 'execution' } });
  });

  test('a confirmed draft-save keeps the form locked until the refreshed execution arrives', async () => {
    let finishRefresh: () => void = () => undefined;
    mockRefetchQueries.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishRefresh = resolve;
      }),
    );
    const { save, undo } = mockMutations();
    save.mockResolvedValue({
      data: {
        jobExecutionSave: {
          _id: 'execution',
          status: 'posted',
          parentId: null,
        },
      },
    });
    openSaved();
    clickButton('save-with-draft-status');
    await waitFor(() => expect(undo).toHaveBeenCalled());
    await waitFor(() => expect(mockRefetchQueries).toHaveBeenCalled());
    expect(
      screen
        .getByRole('button', { name: /save-with-draft-status/ })
        .matches(':disabled'),
    ).toBe(true);
    expect(
      screen.getByRole('button', { name: 'cancel' }).matches(':disabled'),
    ).toBe(true);
    expect(mockClosePanel).not.toHaveBeenCalled();
    await act(async () => finishRefresh());
    await waitFor(() => expect(mockClosePanel).toHaveBeenCalledTimes(1));
  });

  test('a rejected draft-save of a posted execution never undoes its transactions', async () => {
    const { save, undo, post } = mockMutations();
    save.mockRejectedValue(new Error('Actuals validation failed'));
    openSaved();
    clickButton('save-with-draft-status');
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
    expect(mockClosePanel).not.toHaveBeenCalled();
  });

  test('a failed execution opens read-only with its error and can only be closed', () => {
    mockMutations();
    mockDetail = {
      ...postedExecution,
      status: 'error',
      error: 'Product raw has no remainder',
    };
    openSaved();
    expect(screen.getByRole('alert').textContent).toBe(
      'Product raw has no remainder',
    );
    expect(
      screen.queryByRole('button', { name: 'save-with-draft-status' }),
    ).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'production-remove-job' })
        .matches(':disabled'),
    ).toBe(true);
    const expandJob = screen.getByRole('button', { name: 'production-job 1' });
    expect(expandJob.matches(':disabled')).toBe(false);
    fireEvent.click(expandJob);
    expect(screen.getByRole('region')).toBeTruthy();
    clickButton('cancel');
    expect(mockClosePanel).toHaveBeenCalledTimes(1);
  });

  test('shows a spinner while the execution loads', () => {
    mockDetail = undefined;
    mockDetailLoading = true;
    openSaved();
    expect(screen.getByText('loading')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'cancel' })).toBeNull();
  });

  test('an execution id that no longer exists shows the not-found state', () => {
    mockDetail = undefined;
    openSaved('deleted-execution');
    expect(screen.getByRole('status').textContent).toBe('no-results-found');
    expect(screen.queryByRole('spinbutton')).toBeNull();
  });

  test('a server error while loading is shown instead of the form', () => {
    mockDetail = undefined;
    mockDetailError = new Error('Job execution not found');
    openSaved('missing-execution');
    expect(screen.getByRole('status').textContent).toBe(
      'Job execution not found',
    );
    expect(
      screen.queryByRole('button', { name: 'save & production-post' }),
    ).toBeNull();
  });
});
