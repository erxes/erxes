import { ButtonHTMLAttributes, ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { FixedAssetChooserBody } from '../FixedAssetChooser';
import { TChooserItem, TFixedAssetChoice } from '../types';
import { addFxaChoices, availableFxaChooserItems } from '../selection';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('use-debounce', () => ({ useDebounce: (value: string) => [value] }));
jest.mock('erxes-ui', () => {
  const Table = Object.assign(
    ({ children, className }: { children: ReactNode; className?: string }) => (
      <table className={className}>{children}</table>
    ),
    { Header: 'thead', Body: 'tbody', Row: 'tr', Cell: 'td', Head: 'th' },
  );
  return {
    Table,
    Button: ({
      children,
      onClick,
      disabled,
      'aria-label': label,
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
      >
        {children}
      </button>
    ),
    Checkbox: ({
      checked,
      onCheckedChange,
      disabled,
      'aria-label': label,
    }: {
      checked: boolean | 'indeterminate';
      onCheckedChange: () => void;
      disabled?: boolean;
      'aria-label': string;
    }) => (
      <input
        type="checkbox"
        checked={checked === true}
        aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
        disabled={disabled}
        aria-label={label}
        onChange={onCheckedChange}
      />
    ),
    Sheet: { Content: 'div', Footer: 'div' },
    Input: 'input',
    Label: 'span',
    Skeleton: 'div',
    toast: jest.fn(),
  };
});
jest.mock('ui-modules', () => ({
  BranchBadge: ({ branchId }: { branchId: string }) => (
    <span>{`Branch ${branchId.slice(-1)}`}</span>
  ),
  DepartmentBadge: ({ departmentId }: { departmentId: string }) => (
    <span>{`Department ${departmentId.slice(-1)}`}</span>
  ),
  SelectBranches: { Root: () => null },
  SelectDepartments: { Root: () => null },
  SelectMember: () => null,
}));
jest.mock('@/settings/fixed-assets/components/SelectFixedAsset', () => ({
  SelectFixedAsset: {},
}));
jest.mock(
  '@/settings/fixed-assets/components/SelectFixedAssetCategory',
  () => ({ SelectFixedAssetCategory: () => null }),
);
jest.mock('@/layout/components/AccountingEmptyState', () => ({
  AccountingEmptyState: ({ description }: { description: string }) => (
    <p>{description}</p>
  ),
}));
const mockQuery = jest.fn();
jest.mock('@apollo/client', () => ({
  useQuery: (...args: unknown[]) => mockQuery(...args),
}));

const item: TChooserItem = {
  asset: {
    _id: 'pc',
    code: 'PC',
    name: 'Computers',
    description: 'Verbose income description',
    originalCost: 100,
  },
  locations: [
    {
      branchId: 'branch-a',
      departmentId: 'dept-a',
      remainder: 5,
      owners: [{ ownerId: 'member', code: 'serial', count: 2 }],
    },
    { branchId: 'branch-b', departmentId: 'dept-b', remainder: 3, owners: [] },
  ],
  unlocatedOwners: [],
};
const renderChooser = (
  props: { journal?: string; allLocations?: boolean } = {},
) => {
  const onChoose = jest.fn();
  const onClose = jest.fn();
  render(
    <FixedAssetChooserBody
      journal={TrJournalEnum.FXA_OUT}
      date="2026-01-01"
      multiple
      onChoose={onChoose}
      onClose={onClose}
      {...props}
    />,
  );
  return { onChoose, onClose };
};
const clickGroup = () => {
  const row = screen
    .getByRole('checkbox', { name: 'fixed-asset: PC' })
    .closest('tr');
  if (!row) throw new Error('Missing asset group');
  fireEvent.click(row);
};
beforeEach(() => {
  mockQuery.mockImplementation(
    (_query: unknown, options: { variables: { searchValue?: string } }) => ({
      data: {
        accountingFixedAssetChooser: {
          items: options.variables.searchValue ? [] : [item],
          totalCount: 1,
          hasMore: true,
        },
      },
      loading: false,
      refetch: jest.fn(),
    }),
  );
});

test('clicking a group selects its locations; selected rows leave results and clicking one returns it', () => {
  const { onChoose, onClose } = renderChooser();
  expect(screen.queryByText('Verbose income description')).toBeNull();
  expect(screen.getByText('Department a')).toBeTruthy();
  expect(screen.queryByText('dept-a')).toBeNull();
  expect(
    screen.queryByRole('columnheader', { name: 'asset-custodian' }),
  ).toBeNull();
  expect(screen.getAllByRole('row')).toHaveLength(4);
  expect(screen.queryByText('serial')).toBeNull();
  clickGroup();
  const selected = screen.getByRole('region', { name: 'fxa-chooser-selected' });
  expect(
    within(selected).getAllByRole('button', { name: 'remove-selected: PC' }),
  ).toHaveLength(2);
  expect(
    screen.queryByRole('checkbox', { name: 'fixed-asset: PC' }),
  ).toBeNull();
  const row = within(selected)
    .getAllByRole('button', { name: 'remove-selected: PC' })[0]
    .closest('tr');
  if (!row) throw new Error('Missing selected row');
  fireEvent.keyDown(row, { key: 'Enter' });
  expect(
    screen.getByRole('checkbox', { name: 'fixed-asset: PC, branch-a, dept-a' }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'fxa-chooser-apply' }));
  expect(onChoose).toHaveBeenCalledWith([
    expect.objectContaining({ location: item.locations[1] }),
  ]);
  expect(onClose).toHaveBeenCalledTimes(1);
});

test('pending selections survive filter and page changes', () => {
  const { onChoose } = renderChooser();
  clickGroup();
  fireEvent.change(screen.getByPlaceholderText('fxa-chooser-search'), {
    target: { value: 'different asset' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'next' }));
  expect(
    screen.getByRole('region', { name: 'fxa-chooser-selected' }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'fxa-chooser-apply' }));
  expect(onChoose.mock.calls[0][0]).toHaveLength(2);
});

test.each([
  {
    journal: TrJournalEnum.FXA_CAPITAL,
    allLocations: true,
    location: undefined,
  },
  {
    journal: TrJournalEnum.FXA_JUSTIFY,
    allLocations: false,
    location: item.locations[0],
  },
])(
  'asset-scoped journal $journal selects one asset rather than duplicating locations',
  ({ journal, allLocations, location }) => {
    const { onChoose } = renderChooser({ journal, allLocations });
    clickGroup();
    fireEvent.click(screen.getByRole('button', { name: 'fxa-chooser-apply' }));
    expect(onChoose).toHaveBeenCalledWith([
      { asset: item.asset, ...(location ? { location } : {}) },
    ]);
  },
);

test('custodian and whole-location choices replace one another without double-counting', () => {
  const location = item.locations[0];
  const owned: TFixedAssetChoice = {
    asset: item.asset,
    location,
    owner: location.owners[0],
  };
  const aggregate: TFixedAssetChoice = { asset: item.asset, location };
  const selected = addFxaChoices([], [owned], true, false);
  expect(
    availableFxaChooserItems([item], selected, false)[0].locations[0].owners,
  ).toEqual([]);
  expect(addFxaChoices(selected, [aggregate], true, false)).toEqual([
    aggregate,
  ]);
  expect(addFxaChoices([aggregate], [owned], true, false)).toEqual([owned]);
});
