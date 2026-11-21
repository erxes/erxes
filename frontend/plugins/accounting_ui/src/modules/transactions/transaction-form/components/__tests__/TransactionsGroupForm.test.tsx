import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ChangeEvent, ReactNode } from 'react';
import { TransactionsGroupForm } from '../TransactionsGroupForm';

const mockUpdate = jest.fn();
const mockActiveTrs = [
  {
    _id: 'source',
    journal: 'main',
    status: 'requested',
    mentionUserIds: ['first'],
  },
];

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('erxes-ui', () => {
  const { Controller, FormProvider } = jest.requireActual('react-hook-form');
  const Children = ({ children }: { children?: ReactNode }) => children;
  const routeParams = new Map([
    ['parentId', 'parent'],
    ['trId', 'generated-row'],
  ]);

  return {
    Form: Object.assign(FormProvider, {
      Field: Controller,
      Item: Children,
      Label: Children,
      Control: Children,
      Message: () => null,
    }),
    Select: Object.assign(
      ({
        children,
        value,
        onValueChange,
      }: {
        children: ReactNode;
        value?: string;
        onValueChange: (value: string) => void;
      }) => (
        <select
          aria-label="status"
          value={value ?? ''}
          onChange={(event) => onValueChange(event.target.value)}
        >
          {children}
        </select>
      ),
      {
        Trigger: () => null,
        Value: () => null,
        Content: Children,
        Group: Children,
        Label: () => null,
        Separator: () => null,
        Item: ({ children, value }: { children: ReactNode; value: string }) => (
          <option value={value}>{children}</option>
        ),
      },
    ),
    DatePicker: () => null,
    Input: 'input',
    useQueryState: (key: string) => [routeParams.get(key) ?? null],
  };
});
jest.mock('ui-modules', () => ({
  currentUserState: jest.requireActual('jotai').atom({ _id: 'editor' }),
  SelectMember: {
    FormItem: ({
      mode,
      onValueChange,
      value,
    }: {
      mode: string;
      onValueChange: (users: string[]) => void;
      value: string[];
    }) =>
      mode === 'multiple' ? (
        <input
          aria-label="recipients"
          value={value.join(',')}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onValueChange(event.target.value.split(','))
          }
        />
      ) : null,
  },
}));
jest.mock('@/settings/hooks/useMainConfigs', () => ({
  useMainConfigs: () => ({ loading: false }),
}));
jest.mock('../../contants/defaultValues', () => ({
  JOURNALS_BY_JOURNAL: (journal: string) => ({ journal, details: [] }),
}));
jest.mock('../../contants/transactionSchema', () => ({
  transactionGroupSchema: jest.requireActual('zod').z.object({}).passthrough(),
}));
jest.mock('../../hooks/useTransactionsCreate', () => ({
  useTransactionsCreate: () => ({}),
}));
jest.mock('../../hooks/useTransactionsDetail', () => ({
  useTransactionsDetail: () => ({ activeTrs: mockActiveTrs }),
}));
jest.mock('../../hooks/useTransactionsUpdate', () => ({
  useTransactionsUpdate: () => ({ updateTransaction: mockUpdate }),
}));
jest.mock('../../hooks/useTransactionsDecide', () => ({
  useTransactionsDecide: () => ({ decide: jest.fn(), loading: false }),
}));
jest.mock('../../graphql/queries/accTransactionsDetail', () => ({
  TRANSACTIONS_DETAIL_QUERY: {},
}));
jest.mock('../TransactionTabs', () => ({ TransactionsTabsList: () => null }));
jest.mock('../TrWorkflowActions', () => ({
  TrWorkflowActions: ({
    showDecision,
    manageOpen,
    onManageChange,
  }: {
    showDecision: boolean;
    manageOpen: boolean;
    onManageChange: (open: boolean) => void;
  }) => (
    <>
      {showDecision && <span>decision-buttons</span>}
      <button type="button" onClick={() => onManageChange(!manageOpen)}>
        manage
      </button>
    </>
  ),
}));
jest.mock('../Summary', () => ({
  Summary: ({
    workflowActions,
    hideRecordActions,
  }: {
    workflowActions: ReactNode;
    hideRecordActions?: boolean;
  }) => (
    <>
      {workflowActions}
      {!hideRecordActions && <button type="submit">Save</button>}
    </>
  ),
}));

afterEach(() => {
  mockActiveTrs[0].mentionUserIds = ['first'];
});

it('opens a listed approver in the decision view and brings it back when the manage toggle is undone', () => {
  mockActiveTrs[0].mentionUserIds = ['editor'];
  render(<TransactionsGroupForm />);

  expect(screen.getByText('decision-buttons')).toBeTruthy();
  expect(screen.queryByRole('combobox', { name: 'status' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();

  fireEvent.click(screen.getByRole('button', { name: 'manage' }));
  expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  const status = screen.getByRole('combobox', { name: 'status' });
  expect(screen.getByText('decision-buttons')).toBeTruthy();

  fireEvent.change(status, { target: { value: 'complete' } });
  expect(screen.queryByText('decision-buttons')).toBeNull();

  fireEvent.change(status, { target: { value: 'requested' } });
  expect(screen.getByText('decision-buttons')).toBeTruthy();

  fireEvent.change(status, { target: { value: 'complete' } });
  fireEvent.click(screen.getByRole('button', { name: 'manage' }));
  expect(screen.queryByRole('combobox', { name: 'status' })).toBeNull();
  expect(screen.getByText('decision-buttons')).toBeTruthy();
});

it('loads saved recipients and shows the editable picker as the form status changes', async () => {
  render(<TransactionsGroupForm />);

  expect(screen.getByDisplayValue('first')).toBeTruthy();

  const status = screen.getByRole('combobox', { name: 'status' });
  fireEvent.change(status, { target: { value: 'draft' } });
  expect(screen.queryByRole('textbox', { name: 'recipients' })).toBeNull();

  fireEvent.change(status, { target: { value: 'mentioned' } });
  const recipients = screen.getByRole('textbox', { name: 'recipients' });
  fireEvent.change(recipients, { target: { value: 'first,second' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          trDocs: [
            expect.objectContaining({
              status: 'mentioned',
              mentionUserIds: ['first', 'second'],
            }),
          ],
        }),
      }),
    ),
  );
});
