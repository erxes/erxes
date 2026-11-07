/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { ICustomer } from '@/contacts/types/customerType';
import { CustomersMerge } from '../CustomersMerge';

const mockResetSelection = jest.fn();
const mockDismissPath = jest.fn();
const mergePath =
  '/module/contacts%2Fcustomers%2Fcustomers-command-bar%2Fmerge%2FMergeSheet';
let mockPanel = { path: mergePath, dismissPath: mockDismissPath };
let mockComplete: () => void;
let mockAutoComplete = true;
let mockSubmittedIds: string[] = [];

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock(
  'erxes-ui',
  () => ({
    ChoiceboxGroup: ({ children }: PropsWithChildren) => <div>{children}</div>,
    RecordTable: {
      useRecordTable: () => ({
        table: { resetRowSelection: mockResetSelection },
      }),
    },
    useToast: () => ({ toast: jest.fn() }),
  }),
  { virtual: true },
);
jest.mock('ui-modules', () => ({ useSidePanel: () => mockPanel }), {
  virtual: true,
});
jest.mock(
  '@/side-panel/states/modulePanelState',
  () => ({
    getModulePanelPath: (name: string) => `/module/${encodeURIComponent(name)}`,
  }),
  { virtual: true },
);
jest.mock(
  '@/contacts/customers/hooks/useMergeCustomers',
  () => ({
    useMergeCustomers: () => ({
      mergeCustomers: ({
        onCompleted,
        variables,
      }: {
        onCompleted: () => void;
        variables: { customerIds: string[] };
      }) => {
        mockSubmittedIds = variables.customerIds;
        mockComplete = onCompleted;
        if (mockAutoComplete) onCompleted();
      },
    }),
  }),
  { virtual: true },
);
jest.mock('../MergeSheet', () => ({
  CUSTOMERS_MERGE_PANEL:
    'contacts/customers/customers-command-bar/merge/MergeSheet',
  MergeSheet: ({
    children,
    onSave,
    onOpenChange,
  }: PropsWithChildren<{
    onSave: () => void;
    onOpenChange?: (open: boolean) => void;
  }>) => (
    <div>
      <button onClick={() => onOpenChange?.(true)}>Open merge</button>
      {children}
      <button onClick={onSave}>Save</button>
    </div>
  ),
}));
jest.mock('../MergingFieldContainer', () => ({
  MergingFieldContainer: () => null,
}));
jest.mock('../MergeMap', () => ({ MergeMap: [] }));

beforeEach(() => {
  jest.clearAllMocks();
  mockAutoComplete = true;
  mockPanel = { path: mergePath, dismissPath: mockDismissPath };
});

it('merges the pair captured on open after the underlying table selection changes', () => {
  const first = [
    { _id: 'a', firstName: 'A' },
    { _id: 'b', firstName: 'B' },
  ];
  const view = render(<CustomersMerge customers={first} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open merge' }));
  view.rerender(
    <CustomersMerge customers={[{ _id: 'c', firstName: 'C' }]} disabled />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  expect(mockSubmittedIds).toEqual(['a', 'b']);
});

it('closes the editor and clears table selection after refetch removes the selected rows', () => {
  const props: {
    customers: ICustomer[];
    rows: { toggleSelected: () => void }[];
  } = {
    customers: [],
    rows: [
      {
        toggleSelected: () => {
          throw new Error('getRow could not find the removed row');
        },
      },
    ],
  };
  render(<CustomersMerge {...props} />);

  fireEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(mockDismissPath).toHaveBeenCalledWith(
    '/module/contacts%2Fcustomers%2Fcustomers-command-bar%2Fmerge%2FMergeSheet',
  );
  expect(mockResetSelection).toHaveBeenCalledWith(true);
});

it('preserves a different panel opened while the merge was pending', () => {
  mockAutoComplete = false;
  const previousDismiss = mockPanel.dismissPath;
  const view = render(<CustomersMerge customers={[]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  mockPanel = { path: '/detail/core:customer/other', dismissPath: jest.fn() };
  view.rerender(<CustomersMerge customers={[]} />);
  act(() => mockComplete());
  expect(previousDismiss).not.toHaveBeenCalled();
  expect(mockPanel.dismissPath).not.toHaveBeenCalled();
  expect(mockResetSelection).toHaveBeenCalledWith(true);
});

it('dismisses the merge through the latest navigation state when it is still open', () => {
  mockAutoComplete = false;
  const previousDismiss = mockPanel.dismissPath;
  const view = render(<CustomersMerge customers={[]} />);
  fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  mockPanel = { path: mergePath, dismissPath: jest.fn() };
  view.rerender(<CustomersMerge customers={[]} />);
  act(() => mockComplete());
  expect(previousDismiss).not.toHaveBeenCalled();
  expect(mockPanel.dismissPath).toHaveBeenCalledWith(mergePath);
});
