import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import type { CellContext } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import { adjustDetailTableColumns } from '@/adjustments/inventories/components/AdjustInventoryDetailColumns';
import { IAdjustInvDetail } from '@/adjustments/inventories/types/AdjustInventory';

jest.mock('react-router-dom', () => ({ Link: () => null }));
jest.mock(
  'erxes-ui',
  () => ({
    RecordTable: { MoreButton: () => null, ColumnSelector: () => null },
    RecordTableInlineCell: ({ children }: { children: ReactNode }) => (
      <div data-testid="cell">{children}</div>
    ),
    CurrencyFormatedDisplay: () => null,
    CurrencyCode: { MNT: 'MNT' },
  }),
  { virtual: true },
);
jest.mock(
  'ui-modules',
  () => ({
    BranchBadge: ({ branchId }: { branchId: string }) => (
      <span>{`branch:${branchId}`}</span>
    ),
    DepartmentBadge: ({ departmentId }: { departmentId: string }) => (
      <span>{`department:${departmentId}`}</span>
    ),
  }),
  { virtual: true },
);

const t = ((key: string) => key) as TFunction<'accounting'>;

const renderLocation = (
  id: 'branch' | 'department',
  detail: Partial<IAdjustInvDetail>,
) => {
  const column = adjustDetailTableColumns(t).find((col) => col.id === id);
  const cell = column?.cell as (
    context: CellContext<IAdjustInvDetail, unknown>,
  ) => ReactNode;
  render(
    <>
      {cell({
        row: { original: { _id: 'detail-1', ...detail } },
      } as CellContext<IAdjustInvDetail, unknown>)}
    </>,
  );
  return screen.getByTestId('cell').textContent;
};

describe('adjust inventory detail location cells', () => {
  test('a costed line without a branch shows a dash, not undefined', () => {
    expect(renderLocation('branch', { branchId: undefined })).toBe('-');
  });

  test('a costed line without a department shows a dash', () => {
    expect(renderLocation('department', { departmentId: '' })).toBe('-');
  });

  test('a costed line names its branch through the shared badge', () => {
    expect(renderLocation('branch', { branchId: 'branch-ub' })).toBe(
      'branch:branch-ub',
    );
  });

  test('a costed line names its department through the shared badge', () => {
    expect(renderLocation('department', { departmentId: 'dep-store' })).toBe(
      'department:dep-store',
    );
  });
});
