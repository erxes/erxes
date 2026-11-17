import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { flexRender } from '@tanstack/react-table';
import type { CellContext } from '@tanstack/react-table';
import { usePermissionCheck } from 'ui-modules';
import { AddJobExecution } from '@/inventories/job-executions/JobExecutionEditor';
import { jobExecutionColumns } from '@/inventories/job-executions/JobExecutionColumns';
import { JobExecution } from '@/inventories/job-executions/types';

const mockOpenDraft = jest.fn();
const mockOpenDetail = jest.fn();
const mockUseSettingsPanel = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-router', () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));
jest.mock('@apollo/client', () => ({
  useMutation: () => [jest.fn(), { loading: false }],
  useApolloClient: () => ({ refetchQueries: jest.fn() }),
}));
jest.mock('erxes-ui', () => {
  const { createContext, useContext, cloneElement, forwardRef } =
    jest.requireActual<typeof import('react')>('react');
  const PopoverContext = createContext<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>({ open: false, onOpenChange: () => undefined });
  const Popover = Object.assign(
    ({
      children,
      open,
      onOpenChange,
    }: {
      children: ReactNode;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }) => (
      <PopoverContext.Provider value={{ open, onOpenChange }}>
        {children}
      </PopoverContext.Provider>
    ),
    {
      Trigger: ({ children }: { children: ReactElement }) => {
        const { open, onOpenChange } = useContext(PopoverContext);
        return cloneElement(children as ReactElement<{ onClick: () => void }>, {
          onClick: () => onOpenChange(!open),
        });
      },
    },
  );
  return {
    Popover,
    Combobox: {
      Content: ({ children }: { children: ReactNode }) =>
        useContext(PopoverContext).open ? (
          <div role="menu">{children}</div>
        ) : null,
    },
    Command: Object.assign(
      ({ children }: { children: ReactNode }) => <div>{children}</div>,
      {
        List: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        Item: ({
          children,
          onSelect,
        }: {
          children: ReactNode;
          onSelect?: () => void;
        }) => (
          <button type="button" role="menuitem" onClick={onSelect}>
            {children}
          </button>
        ),
      },
    ),
    RecordTable: {
      MoreButton: forwardRef<HTMLButtonElement, Record<string, unknown>>(
        (props, ref) => <button type="button" ref={ref} {...props} />,
      ),
      ColumnSelector: () => null,
      InlineHead: () => null,
      checkboxColumn: { id: 'checkbox' },
    },
    RecordTableInlineCell: ({ children }: { children: ReactNode }) => children,
    Badge: ({ children }: { children: ReactNode }) => children,
    Button: ({
      children,
      onClick,
    }: {
      children: ReactNode;
      onClick?: () => void;
    }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    toast: jest.fn(),
    useConfirm: () => ({ confirm: jest.fn() }),
  };
});
jest.mock('ui-modules', () => ({
  BranchesInline: () => null,
  DepartmentsInline: () => null,
  usePermissionCheck: jest.fn(),
}));
jest.mock('@/settings/account/components/AccountsInline', () => ({
  AccountsInline: () => null,
}));
jest.mock('@/settings/account/components/SelectAccount', () => ({
  SelectAccount: () => null,
}));
jest.mock('@/settings/jobs/components/JobForm', () => ({
  JobForm: () => null,
}));
jest.mock('@/inventories/job-executions/SelectExecutionJob', () => ({
  SelectExecutionJob: () => null,
}));
jest.mock('@/settings/hooks/useSettingsPanel', () => ({
  useSettingsPanel: (contentType: string) => mockUseSettingsPanel(contentType),
}));

const execution: JobExecution = {
  _id: 'execution-7',
  date: '2026-11-02T08:00:00.000Z',
  status: 'draft',
  parentId: null,
  ptrId: null,
  error: null,
  description: 'Bread batch',
  inputAccountId: 'flour-stock',
  inputBranchId: null,
  inputDepartmentId: null,
  outputAccountId: 'bread-stock',
  outputBranchId: null,
  outputDepartmentId: null,
  jobs: [],
};

const renderRowMenu = (row: JobExecution) => {
  const column = jobExecutionColumns.find(({ id }) => id === 'more');
  const context = { row: { original: row } } as CellContext<
    JobExecution,
    unknown
  >;
  render(<>{flexRender(column?.cell, context)}</>);
  fireEvent.click(screen.getByLabelText('production-actions'));
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseSettingsPanel.mockReturnValue({
    openDraft: mockOpenDraft,
    openDetail: mockOpenDetail,
  });
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => true } as never);
});

test('clicking add opens a job execution draft in the side panel', () => {
  render(<AddJobExecution />);
  fireEvent.click(screen.getByRole('button', { name: 'production-add' }));
  expect(mockUseSettingsPanel).toHaveBeenCalledWith('accounting:jobExecution');
  expect(mockOpenDraft).toHaveBeenCalledTimes(1);
});

test('choosing edit on a row opens that execution in the side panel and closes the menu', () => {
  renderRowMenu(execution);
  fireEvent.click(screen.getByRole('menuitem', { name: 'edit' }));
  expect(mockUseSettingsPanel).toHaveBeenCalledWith('accounting:jobExecution');
  expect(mockOpenDetail).toHaveBeenCalledWith('execution-7');
  expect(screen.queryByRole('menu')).toBeNull();
});

test('a read-only accountant can still open a row to view it', () => {
  jest
    .mocked(usePermissionCheck)
    .mockReturnValue({ hasActionPermission: () => false } as never);
  renderRowMenu({ ...execution, _id: 'execution-9', status: 'posted' });
  fireEvent.click(screen.getByRole('menuitem', { name: 'production-view' }));
  expect(mockOpenDetail).toHaveBeenCalledWith('execution-9');
});
