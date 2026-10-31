/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import type { ICustomer } from '@/contacts/types/customerType';
import { CustomersMerge } from '../CustomersMerge';

const mockResetSelection = jest.fn();
const mockDismissPath = jest.fn();

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
jest.mock(
  'ui-modules',
  () => ({ useSidePanel: () => ({ dismissPath: mockDismissPath }) }),
  { virtual: true },
);
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
      mergeCustomers: ({ onCompleted }: { onCompleted: () => void }) =>
        onCompleted(),
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
  }: PropsWithChildren<{ onSave: () => void }>) => (
    <div>
      {children}
      <button onClick={onSave}>Save</button>
    </div>
  ),
}));
jest.mock('../MergingFieldContainer', () => ({
  MergingFieldContainer: () => null,
}));
jest.mock('../MergeMap', () => ({ MergeMap: [] }));

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
