import type { ReactNode } from 'react';
import type { TFunction } from 'i18next';
import type { CellContext } from '@tanstack/table-core';
import { render, screen } from '@testing-library/react';
import { productColumns } from '@/inventories/remainders/components/ProductColumns';
import { IRemainderProduct } from '@/inventories/remainders/types/productTypes';

jest.mock(
  'erxes-ui',
  () => ({
    RecordTable: { checkboxColumn: { id: 'checkbox' } },
    RecordTableInlineCell: ({ children }: { children: ReactNode }) => (
      <div>{children}</div>
    ),
    TextOverflowTooltip: ({ value }: { value?: string }) => (
      <span data-testid="value">{value}</span>
    ),
    CurrencyFormatedDisplay: () => null,
    CurrencyCode: { MNT: 'MNT' },
  }),
  { virtual: true },
);
jest.mock('jotai', () => ({ useSetAtom: () => jest.fn() }));
jest.mock('@/inventories/remainders/states/productDetailStates', () => ({
  selectedRemainderProductAtom: {},
}));

const t = ((key: string) => key) as TFunction<'accounting'>;

const showSummary = (
  id: 'remainder' | 'soonIn' | 'soonOut',
  remainder: unknown,
) => {
  const column = productColumns(t).find((col) => col.id === id);
  const cell = column?.cell as (
    context: CellContext<IRemainderProduct, unknown>,
  ) => ReactNode;
  const product = {
    _id: 'prdemo-flour',
    code: 'RM-001',
    name: 'Flour',
    remainder,
  } as IRemainderProduct;
  render(
    <>
      {cell({
        cell: { row: { original: product } },
      } as CellContext<IRemainderProduct, unknown>)}
    </>,
  );
  return screen.getByTestId('value').textContent;
};

describe('remainder product summary cells', () => {
  test('shows the counted remainder of a stocked product', () => {
    expect(
      showSummary('remainder', { remainder: 120, soonIn: 30, soonOut: 5 }),
    ).toBe('120');
  });

  test('shows zero incoming stock instead of hiding it', () => {
    expect(showSummary('soonIn', { remainder: 120, soonIn: 0 })).toBe('0');
  });

  test('stays blank for a product that has never been counted', () => {
    expect(showSummary('remainder', null)).toBe('');
  });

  test('stays blank instead of printing [object Object] for a malformed value', () => {
    expect(showSummary('soonOut', { soonOut: { pending: 4 } })).toBe('');
  });
});
