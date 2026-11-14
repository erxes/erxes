import type { IModels } from '~/connectionResolvers';
import type {
  IAdjustFixedAssetDocument,
  IAdjustFxaDetail,
} from '../../@types/adjustFixedAsset';
import type { ITransaction } from '../../@types/transaction';
import { JOURNALS, TR_SIDES } from '../../@types/constants';
import { createAdjustFixedAssetTransaction } from '../adjustFixedAssets';

jest.mock('../trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn(),
}));
jest.mock('../fxaIncomeTaxRates', () => ({
  getFxaIncomeTaxRates: jest.fn(
    async () =>
      new Map([
        ['a', 10],
        ['b', 10],
        ['c', 10],
      ]),
  ),
}));

const adjust = {
  _id: 'adjust',
  date: new Date('2026-01-31'),
  status: 'process',
  description: 'January',
} as IAdjustFixedAssetDocument;
const snapshot = (
  fixedAssetId: string,
  branchId: string,
  amount: number,
): IAdjustFxaDetail => ({
  adjustId: 'adjust',
  fixedAssetId,
  branchId,
  departmentId: 'department',
  accountId: 'cost',
  originalCost: 1000,
  depreciationAmount: amount,
  accumulatedDepreciation: 100,
  taxAccumulatedDepreciation: 60,
});
const fixture = (initial: ITransaction[] = []) => {
  let posted = initial;
  let snapshots = [
    snapshot('a', 'branch', 10),
    snapshot('b', 'branch', 20),
    snapshot('c', 'other-branch', 30),
  ];
  const write = (docs: ITransaction[], parentId: string) =>
    docs.map((doc, index) => ({ ...doc, _id: `row-${index}`, parentId }));
  const create = jest.fn(async (docs: ITransaction[]) => {
    const rows = write(docs, 'new-parent');
    posted.push(...rows);
    return rows;
  });
  const update = jest.fn(async (parentId: string, docs: ITransaction[]) => {
    const rows = write(docs, parentId);
    posted = [...posted.filter((doc) => doc.parentId !== parentId), ...rows];
    return rows;
  });
  const remove = jest.fn(async ({ parentId }: { parentId: string }) => {
    const pointers = new Set(
      posted.filter((doc) => doc.parentId === parentId).map((doc) => doc.ptrId),
    );
    posted = posted.filter(
      (doc) => doc.parentId !== parentId && !pointers.has(doc.ptrId),
    );
  });
  const find = jest.fn((filter: Record<string, unknown>) => ({
    lean: async () =>
      filter.contentId === 'adjust'
        ? posted.filter(
            (doc) =>
              doc.contentId === 'adjust' &&
              doc.contentType === 'accounting:adjustFixedAsset',
          )
        : [],
  }));
  const models = {
    Configs: {
      getConfigs: async () => [
        {
          subId: 'cost',
          value: {
            depreciationAccountId: 'accumulated',
            taxAssetAccountId: 'dta',
            taxLiabilityAccountId: 'dtl',
          },
        },
      ],
    },
    Transactions: {
      find,
      createPTransaction: create,
      updatePTransaction: update,
      removePTransaction: remove,
    },
    AdjustFxaDetails: {
      find: () => ({ lean: async () => snapshots }),
      updateMany: jest.fn(),
    },
    AdjustFixedAssets: {
      updateAdjustFixedAsset: jest.fn(
        async (_id: string, doc: Record<string, unknown>) => doc,
      ),
    },
  } as unknown as IModels;
  return {
    models,
    create,
    update,
    remove,
    find,
    posted: () => posted,
    setSnapshots: (rows: IAdjustFxaDetail[]) => {
      snapshots = rows;
    },
  };
};
const post = (models: IModels, taxExpenseAccountId?: string) =>
  createAdjustFixedAssetTransaction({
    models,
    userId: 'user',
    adjust,
    expenseAccountId: 'book-expense',
    taxExpenseAccountId,
  });
const signed = (rows: ITransaction[]) =>
  rows.reduce(
    (sum, row) =>
      sum +
      (row.side === TR_SIDES.DEBIT ? 1 : -1) *
        row.details.reduce((total, detail) => total + detail.amount, 0),
    0,
  );

test('asset journals and grouped expense main rows balance in separate pointers under one parent', async () => {
  const f = fixture();
  await post(f.models, 'selected-tax-expense');
  const rows = f.posted();
  const book = rows.find((row) => row.journal === JOURNALS.FXA_DEP);
  const tax = rows.find((row) => row.journal === JOURNALS.FXA_DEFERRED_TAX);
  expect(book?.details).toHaveLength(3);
  expect(tax?.details).toHaveLength(3);
  expect(book?.ptrId).not.toBe(tax?.ptrId);
  expect(new Set(rows.map((row) => row.parentId))).toEqual(
    new Set(['new-parent']),
  );
  const expenses = rows.filter((row) => row.journal === JOURNALS.MAIN);
  expect(
    expenses
      .flatMap((row) => row.details)
      .every((detail) => !detail.fixedAssetId),
  ).toBe(true);
  expect(
    expenses
      .find((row) => row.ptrId === book?.ptrId)
      ?.details.map((detail) => detail.amount),
  ).toEqual([30, 30]);
  expect(expenses.find((row) => row.ptrId === tax?.ptrId)?.details).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        accountId: 'selected-tax-expense',
        branchId: 'branch',
        amount: 8,
      }),
      expect.objectContaining({
        accountId: 'selected-tax-expense',
        branchId: 'other-branch',
        amount: 4,
      }),
    ]),
  );
  for (const ptrId of new Set(rows.map((row) => row.ptrId)))
    expect(signed(rows.filter((row) => row.ptrId === ptrId))).toBeCloseTo(0);
  expect(f.create).toHaveBeenCalledWith(expect.any(Array), 'user', {
    preservePtrIds: true,
  });
});

test('posting again replaces the owned content group even after snapshot links are lost', async () => {
  const f = fixture();
  await post(f.models, 'tax-expense');
  const pointers = new Set(f.posted().map((row) => row.ptrId));
  await post(f.models, 'tax-expense');
  expect(f.create).toHaveBeenCalledTimes(1);
  expect(f.update).toHaveBeenCalledTimes(1);
  expect(f.posted()).toHaveLength(4);
  expect(new Set(f.posted().map((row) => row.ptrId))).toEqual(pointers);
  expect(signed(f.posted())).toBeCloseTo(0);
});

test('old duplicate content groups are cleaned and zero new results remove all old postings', async () => {
  const f = fixture(
    ['old-1', 'old-2', 'old-3'].map((parentId) => ({
      _id: parentId,
      parentId,
      ptrId: 'legacy-shared',
      journal: JOURNALS.FXA_DEP,
      contentType: 'accounting:adjustFixedAsset',
      contentId: 'adjust',
      details: [],
    })),
  );
  await post(f.models, 'tax-expense');
  expect(f.posted()).toHaveLength(4);
  expect(f.remove).toHaveBeenCalledWith({ parentId: 'old-2' });
  f.setSnapshots(
    [snapshot('a', 'branch', 0)].map((row) => ({
      ...row,
      taxAccumulatedDepreciation: row.accumulatedDepreciation,
    })),
  );
  await post(f.models);
  expect(f.posted()).toHaveLength(0);
  expect(f.remove).toHaveBeenCalledWith({ parentId: 'old-1' });
});

test('missing selected tax expense account fails before touching prior postings', async () => {
  const original: ITransaction[] = [
    {
      _id: 'prior',
      parentId: 'old-parent',
      journal: JOURNALS.FXA_DEP,
      contentType: 'accounting:adjustFixedAsset',
      contentId: 'adjust',
      details: [],
    },
  ];
  const f = fixture(original);
  await expect(post(f.models)).rejects.toThrow(
    'Select an income tax expense account',
  );
  expect(f.create).not.toHaveBeenCalled();
  expect(f.update).not.toHaveBeenCalled();
  expect(f.remove).not.toHaveBeenCalled();
  expect(f.posted()).toEqual(original);
});

test('departments are grouped separately and fractional book amounts remain balanced', async () => {
  const f = fixture();
  f.setSnapshots([
    {
      ...snapshot('a', 'branch', 1 / 3),
      departmentId: 'one',
      taxAccumulatedDepreciation: 100,
    },
    {
      ...snapshot('b', 'branch', 1 / 3),
      departmentId: 'two',
      taxAccumulatedDepreciation: 100,
    },
  ]);
  await post(f.models);
  const main = f.posted().find((row) => row.journal === JOURNALS.MAIN);
  expect(main?.details).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ departmentId: 'one', amount: 0.3333 }),
      expect.objectContaining({ departmentId: 'two', amount: 0.3333 }),
    ]),
  );
  expect(Math.abs(signed(f.posted()))).toBeLessThan(0.000001);
});

test('tax expense reversals net by location without requiring an unused expense account', async () => {
  const f = fixture();
  f.setSnapshots([
    snapshot('a', 'branch', 0),
    { ...snapshot('b', 'branch', 0), taxAccumulatedDepreciation: 140 },
  ]);
  await post(f.models);
  expect(f.posted()).toHaveLength(2);
  expect(
    f.posted().every((row) => row.journal === JOURNALS.FXA_DEFERRED_TAX),
  ).toBe(true);
  expect(signed(f.posted())).toBeCloseTo(0);
});

test('the same expense account can be selected without merging the book and tax pointers', async () => {
  const f = fixture();
  await post(f.models, 'book-expense');
  const pointers = new Set(f.posted().map((row) => row.ptrId));
  expect(pointers.size).toBe(2);
  for (const ptrId of pointers)
    expect(signed(f.posted().filter((row) => row.ptrId === ptrId))).toBeCloseTo(
      0,
    );
});

test('an empty recalculated snapshot also removes previously posted content', async () => {
  const f = fixture([
    {
      _id: 'old',
      parentId: 'old-parent',
      ptrId: 'old-pointer',
      journal: JOURNALS.FXA_DEP,
      contentType: 'accounting:adjustFixedAsset',
      contentId: 'adjust',
      details: [],
    },
  ]);
  f.setSnapshots([]);
  await post(f.models);
  expect(f.posted()).toHaveLength(0);
  expect(f.create).not.toHaveBeenCalled();
});
