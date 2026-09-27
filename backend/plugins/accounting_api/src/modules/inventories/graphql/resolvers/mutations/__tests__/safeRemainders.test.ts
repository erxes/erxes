import { IContext } from '~/connectionResolvers';
import {
  JOURNALS,
  TR_SIDES,
} from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import safeRemainderItemMutations from '../safeRemainderItems';
import safeRemainderMutations from '../safeRemainders';

describe('safe remainder counted value validation', () => {
  const context = {
    checkPermission: jest.fn().mockResolvedValue(undefined),
    user: { _id: 'user-1' },
    models: {
      SafeRemainderItems: {
        updateItem: jest.fn(),
      },
    },
  } as unknown as IContext;

  test('rejects negative counted remainder', async () => {
    await expect(
      safeRemainderItemMutations.safeRemainderItemEdit(
        null,
        { _id: 'item-1', remainder: -1 },
        context,
      ),
    ).rejects.toThrow('Counted remainder must be zero or greater');
  });

  test('rejects negative counted unit cost', async () => {
    await expect(
      safeRemainderItemMutations.safeRemainderItemEdit(
        null,
        { _id: 'item-1', trInfo: { unitCost: -1 } },
        context,
      ),
    ).rejects.toThrow('Counted unit cost must be zero or greater');
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
      costIncreaseRule: { accountId: 'cost-increase-counterpart' },
      costDecreaseRule: { accountId: 'cost-decrease-counterpart' },
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
        unitPrice: 11,
        amount: 22,
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
        unitPrice: 5,
        amount: 10,
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
        productId: 'sale-product',
        count: 0,
        unitPrice: 1,
        amount: 3,
      }),
      expect.objectContaining({
        productId: 'equal-count-cost-increase',
        count: 0,
        unitPrice: 1,
        amount: 4,
      }),
    ]);
    expect(
      byJournalAndSide(JOURNALS.INV_JUSTIFY, TR_SIDES.CREDIT)?.details,
    ).toEqual([
      expect.objectContaining({
        productId: 'out-product',
        count: 0,
        unitPrice: 1,
        amount: 8,
      }),
      expect.objectContaining({
        productId: 'zero-cost-income-product',
        count: 0,
        unitPrice: 80,
        amount: 400,
      }),
    ]);
    const increaseWorkflow = createPTransaction.mock.calls.find(
      ([docs]: [ITransaction[]]) =>
        docs[0].journal === JOURNALS.INV_JUSTIFY &&
        docs[0].side === TR_SIDES.DEBIT,
    )?.[0] as ITransaction[];
    const decreaseWorkflow = createPTransaction.mock.calls.find(
      ([docs]: [ITransaction[]]) =>
        docs[0].journal === JOURNALS.INV_JUSTIFY &&
        docs[0].side === TR_SIDES.CREDIT,
    )?.[0] as ITransaction[];

    expect(increaseWorkflow[1]).toEqual(
      expect.objectContaining({
        journal: JOURNALS.MAIN,
        side: TR_SIDES.CREDIT,
        details: [
          expect.objectContaining({
            accountId: 'cost-increase-counterpart',
            amount: 7,
          }),
        ],
      }),
    );
    expect(decreaseWorkflow[1]).toEqual(
      expect.objectContaining({
        journal: JOURNALS.MAIN,
        side: TR_SIDES.DEBIT,
        details: [
          expect.objectContaining({
            accountId: 'cost-decrease-counterpart',
            amount: 408,
          }),
        ],
      }),
    );

    expect(transactions.map(({ journal, side }) => [journal, side])).toEqual([
      [JOURNALS.INV_INCOME, undefined],
      [JOURNALS.INV_OUT, undefined],
      [JOURNALS.INV_SALE, undefined],
      [JOURNALS.INV_JUSTIFY, TR_SIDES.DEBIT],
      [JOURNALS.INV_JUSTIFY, TR_SIDES.CREDIT],
    ]);
  });
});
