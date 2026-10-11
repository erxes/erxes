import { IContext } from '~/connectionResolvers';
import { JOURNALS, TR_SIDES } from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import {
  safeRemainderItemMutations,
  mergeSafeRemainderImportItems,
} from '../safeRemainderItems';
import safeRemainderMutations from '../safeRemainders';

describe('safe remainder counted value validation', () => {
  const getItem = jest.fn();
  const updateItem = jest.fn();
  const context = {
    checkPermission: jest.fn().mockResolvedValue(undefined),
    user: { _id: 'user-1' },
    models: {
      SafeRemainderItems: {
        getItem,
        updateItem,
      },
      Transactions: {
        aggregate: jest.fn().mockResolvedValue([]),
      },
    },
  } as unknown as IContext;

  beforeEach(() => {
    getItem.mockReset();
    updateItem.mockReset();
  });

  test('rejects negative counted remainder', async () => {
    await expect(
      safeRemainderItemMutations.safeRemainderItemEdit(
        null,
        { _id: 'item-1', remainder: -1 },
        context,
      ),
    ).rejects.toThrow('Counted remainder must be zero or greater');
  });

  test('rejects negative counted cost', async () => {
    await expect(
      safeRemainderItemMutations.safeRemainderItemEdit(
        null,
        { _id: 'item-1', trInfo: { unitCost: -1 } },
        context,
      ),
    ).rejects.toThrow('Counted cost must be zero or greater');
  });

  test('defaults counted total cost from active unit cost when count changes', async () => {
    getItem.mockResolvedValue({
      _id: 'item-1',
      productId: 'product-1',
      preCount: 10,
      count: 10,
      cost: 1000,
      trInfo: { activeCost: 1000, unitCost: 1000 },
    });

    await safeRemainderItemMutations.safeRemainderItemEdit(
      null,
      { _id: 'item-1', remainder: 8 },
      context,
    );

    expect(updateItem).toHaveBeenCalledWith(
      'item-1',
      expect.objectContaining({
        count: 8,
        trInfo: expect.objectContaining({ unitCost: 800 }),
      }),
      'user-1',
    );
  });
});

describe('safe remainder bulk import rules', () => {
  test.each([NaN, Infinity, -Infinity])(
    'rejects non-finite count %s before writing',
    (count) => {
      expect(() =>
        mergeSafeRemainderImportItems([{ productCode: 'P001', count }], 'last'),
      ).toThrow('finite count');
    },
  );

  test('keeps the first duplicate row for the skip rule', () => {
    const merged = mergeSafeRemainderImportItems(
      [
        { productCode: 'P001', count: 4 },
        { productCode: 'P001', count: 9 },
      ],
      'skip',
    );

    expect(merged.P001.count).toBe(4);
  });

  test('adds explicit total costs together for duplicate rows', () => {
    const merged = mergeSafeRemainderImportItems(
      [
        { productCode: 'P001', count: 2, trInfo: { unitCost: 100 } },
        { productCode: 'P001', count: 3, trInfo: { unitCost: 200 } },
      ],
      'add',
    );

    expect(merged.P001).toEqual({
      count: 5,
      trInfo: { unitCost: 300, isCostExplicit: true },
    });
  });
});

describe('safe remainder transaction generation', () => {
  test('creates quantity and directional cost adjustment transactions', async () => {
    const safeRemainder = {
      _id: 'safe-rem-1',
      date: new Date('2026-09-26T00:00:00.000Z'),
      status: 'done',
      branchId: 'branch-1',
      departmentId: 'department-1',
      incomeRule: { accountId: 'inventory-in' },
      outRule: { accountId: 'inventory-out' },
      costIncreaseRule: { accountId: 'cost-increase-inventory' },
      costDecreaseRule: { accountId: 'cost-decrease-inventory' },
      saleRule: {
        accountId: 'sale-income',
        outAccountId: 'inventory-out',
        costAccountId: 'sale-cost',
      },
    };
    const items = [
      {
        productId: 'income-product',
        preCount: 10,
        count: 12,
        trInfo: { activeCost: 5, unitCost: 6 },
      },
      {
        productId: 'out-product',
        preCount: 10,
        count: 8,
        trInfo: { activeCost: 5, unitCost: 4, isSale: false },
      },
      {
        productId: 'default-cost-out-product',
        preCount: 10,
        count: 8,
        cost: 1000,
        trInfo: { activeCost: 1000, isSale: false },
      },
      {
        productId: 'last-price-income-product',
        preCount: 5,
        count: 8,
        cost: 0,
        trInfo: {
          activeCost: 0,
          unitCost: 0,
          isCostExplicit: false,
        },
      },
      {
        productId: 'sale-product',
        preCount: 5,
        count: 3,
        trInfo: {
          activeCost: 2,
          unitCost: 3,
          isSale: true,
          unitPrice: 9,
        },
      },
      {
        productId: 'equal-count-cost-increase',
        preCount: 4,
        count: 4,
        trInfo: { activeCost: 2, unitCost: 3 },
      },
      {
        productId: 'zero-cost-income-product',
        preCount: 1,
        count: 5,
        trInfo: { activeCost: 1000, unitCost: 120 },
      },
      {
        productId: 'zero-count-cost-increase',
        preCount: 0,
        count: 0,
        trInfo: { activeCost: 0, unitCost: 90000 },
      },
      {
        productId: 'cost-decrease-to-zero',
        preCount: 0,
        count: 0,
        trInfo: { activeCost: 500, unitCost: -500 },
      },
      {
        productId: 'legacy-default-total-cost',
        preCount: 10,
        count: 10,
        cost: 50,
        trInfo: { activeCost: 5, unitCost: 5 },
      },
      {
        productId: 'legacy-active-manual-total-cost',
        preCount: 10,
        count: 10,
        cost: 50,
        trInfo: { activeCost: 5, unitCost: 60 },
      },
      {
        productId: 'cost-difference-within-tolerance',
        preCount: 1,
        count: 1,
        trInfo: { activeCost: 100, unitCost: 100.005 },
      },
      {
        productId: 'cost-difference-over-tolerance',
        preCount: 1,
        count: 1,
        trInfo: { activeCost: 100, unitCost: 100.006 },
      },
      {
        productId: 'negative-cost-difference-within-tolerance',
        preCount: 1,
        count: 1,
        trInfo: { activeCost: 100, unitCost: 99.995 },
      },
      {
        productId: 'negative-cost-difference-over-tolerance',
        preCount: 1,
        count: 1,
        trInfo: { activeCost: 100, unitCost: 99.994 },
      },
    ];
    const createPTransaction = jest
      .fn()
      .mockImplementation(async (docs: ITransaction[]) => [
        { parentId: `${docs[0].journal}-${docs[0].side ?? 'main'}` },
      ]);
    const getRemainder = jest.fn().mockResolvedValue(safeRemainder);
    const context = {
      checkPermission: jest.fn().mockResolvedValue(undefined),
      user: { _id: 'user-1' },
      models: {
        SafeRemainders: {
          getRemainder,
          updateOne: jest.fn().mockResolvedValue(undefined),
        },
        SafeRemainderItems: {
          find: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(items),
          }),
        },
        Transactions: {
          createPTransaction,
          aggregate: jest
            .fn()
            .mockResolvedValue([
              { _id: 'last-price-income-product', price: 12 },
            ]),
        },
      },
    } as unknown as IContext;

    await safeRemainderMutations.safeRemainderDoTr(
      null,
      { _id: safeRemainder._id },
      context,
    );

    const transactions = createPTransaction.mock.calls.map(
      ([docs]: [ITransaction[]]) => docs[0],
    );
    const byJournalAndSide = (journal: string, side?: string) =>
      transactions.find(
        (transaction) =>
          transaction.journal === journal && transaction.side === side,
      );

    expect(byJournalAndSide(JOURNALS.INV_INCOME)?.details).toEqual([
      expect.objectContaining({
        productId: 'income-product',
        count: 2,
        unitPrice: 0.5,
        amount: 1,
      }),
      expect.objectContaining({
        productId: 'last-price-income-product',
        count: 3,
        unitPrice: 12,
        amount: 36,
      }),
      expect.objectContaining({
        productId: 'zero-cost-income-product',
        count: 4,
        unitPrice: 0,
        amount: 0,
      }),
    ]);
    expect(byJournalAndSide(JOURNALS.INV_OUT)?.details).toEqual([
      expect.objectContaining({
        productId: 'out-product',
        count: 2,
        unitPrice: 0.5,
        amount: 1,
      }),
      expect.objectContaining({
        productId: 'default-cost-out-product',
        count: 2,
        unitPrice: 100,
        amount: 200,
      }),
    ]);
    expect(byJournalAndSide(JOURNALS.INV_SALE)?.details).toEqual([
      expect.objectContaining({
        productId: 'sale-product',
        count: 2,
        unitPrice: 9,
        amount: 18,
      }),
    ]);
    expect(
      byJournalAndSide(JOURNALS.INV_JUSTIFY, TR_SIDES.DEBIT)?.details,
    ).toEqual([
      expect.objectContaining({
        accountId: 'cost-increase-inventory',
        productId: 'sale-product',
        count: 0,
        unitPrice: 0.6,
        amount: 1.8,
      }),
      expect.objectContaining({
        accountId: 'cost-increase-inventory',
        productId: 'equal-count-cost-increase',
        count: 0,
        unitPrice: 0.25,
        amount: 1,
      }),
      expect.objectContaining({
        accountId: 'cost-increase-inventory',
        productId: 'zero-count-cost-increase',
        count: 0,
        unitPrice: 0,
        amount: 90000,
      }),
      expect.objectContaining({
        accountId: 'cost-increase-inventory',
        productId: 'legacy-active-manual-total-cost',
        count: 0,
        unitPrice: 1,
        amount: 10,
      }),
      expect.objectContaining({
        accountId: 'cost-increase-inventory',
        productId: 'cost-difference-over-tolerance',
        count: 0,
        unitPrice: 0.006,
        amount: 0.006,
      }),
    ]);
    expect(
      byJournalAndSide(JOURNALS.INV_JUSTIFY, TR_SIDES.CREDIT)?.details,
    ).toEqual([
      expect.objectContaining({
        accountId: 'cost-decrease-inventory',
        productId: 'zero-cost-income-product',
        count: 0,
        unitPrice: 176,
        amount: 880,
      }),
      expect.objectContaining({
        accountId: 'cost-decrease-inventory',
        productId: 'cost-decrease-to-zero',
        count: 0,
        unitPrice: 0,
        amount: 500,
      }),
      expect.objectContaining({
        accountId: 'cost-decrease-inventory',
        productId: 'negative-cost-difference-over-tolerance',
        count: 0,
        unitPrice: 0.006,
        amount: 0.006,
      }),
    ]);
    const adjustmentWorkflows = createPTransaction.mock.calls.filter(
      ([docs]: [ITransaction[]]) => docs[0].journal === JOURNALS.INV_JUSTIFY,
    );
    expect(adjustmentWorkflows).toHaveLength(2);
    expect(adjustmentWorkflows.every(([docs]) => docs.length === 1)).toBe(true);

    expect(transactions.map(({ journal, side }) => [journal, side])).toEqual([
      [JOURNALS.INV_INCOME, undefined],
      [JOURNALS.INV_OUT, undefined],
      [JOURNALS.INV_SALE, undefined],
      [JOURNALS.INV_JUSTIFY, TR_SIDES.DEBIT],
      [JOURNALS.INV_JUSTIFY, TR_SIDES.CREDIT],
    ]);
  });
});
