import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../../@types/transaction';
import type { IFxaOwnerRecord } from '@/fixedAssets/@types/fxaOwnerRecord';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

jest.mock('~/connectionResolvers', () => ({ generateModels: jest.fn() }));
jest.mock('erxes-api-shared/utils', () => ({
  sendTRPCMessage: jest.fn(),
}));
import { saveErkhetBatch } from '../erkhetMigration';

type OwnerRow = IFxaOwnerRecord & { _id: string };
type Filter = {
  _id?: { $regex?: string; $nin?: string[] };
  fixedAssetId?: { $in: string[] };
  status?: string;
};
const fixture = () => {
  const rows = new Map<string, OwnerRow>([
    [
      'opening',
      {
        _id: 'opening',
        fixedAssetId: 'asset',
        code: '',
        ownerId: 'old',
        count: 3,
        action: 'received',
        status: 'active',
      },
    ],
  ]);
  const matches = (row: OwnerRow, filter: Filter) =>
    (!filter._id?.$regex || new RegExp(filter._id.$regex).test(row._id)) &&
    !filter._id?.$nin?.includes(row._id) &&
    (!filter.fixedAssetId ||
      filter.fixedAssetId.$in.includes(row.fixedAssetId)) &&
    (!filter.status || filter.status === row.status);
  const query = <T>(value: T) => ({ lean: async () => value });
  const bulkWrite = jest.fn(
    async (
      operations: {
        updateOne: { filter: { _id: string }; update: { $set: OwnerRow } };
      }[],
    ) => {
      for (const { updateOne } of operations)
        rows.set(updateOne.filter._id, updateOne.update.$set);
    },
  );
  const deleteMany = jest.fn(async (filter: Filter) => {
    for (const row of rows.values())
      if (matches(row, filter)) rows.delete(row._id);
  });
  const createPTransaction = jest.fn(async (docs: ITransaction[]) =>
    docs.map((doc) => ({
      ...doc,
      _id: 'financial',
      parentId: 'financial',
      ptrId: 'pointer',
    })),
  );
  const raw = {
    Accounts: { find: () => query([{ _id: 'asset-account', code: '2001' }]) },
    FixedAssets: { find: () => query([{ _id: 'asset', code: 'PC' }]) },
    FxaOwnerRecords: {
      find: (filter: Filter) =>
        query([...rows.values()].filter((row) => matches(row, filter))),
      bulkWrite,
      deleteMany,
    },
    Transactions: {
      findOne: () => query(null),
      createPTransaction,
      updatePTransaction: jest.fn(),
    },
  };
  const doc: ITransaction = {
    journal: 'fxaMove',
    date: new Date('2026-01-01'),
    side: 'ct',
    details: [
      {
        _id: 'erkhet-record-1',
        fixedAssetId: 'PC',
        accountId: '2001',
        count: 2,
        amount: 0,
        unitPrice: 0,
      },
    ],
    followInfos: { moveInBranchId: '', moveInDepartmentId: '' },
    extraData: {
      fxaOwnerOnly: true,
      fxaOwnerRecords: [
        {
          transactionDetailId: 'erkhet-record-1',
          count: 2,
          sourceOwnerId: 'old@example.com',
          ownerId: 'new@example.com',
        },
      ],
    },
  };
  const run = (dryRun = false, docs = [doc]) =>
    saveErkhetBatch({
      models: raw as unknown as IModels,
      subdomain: 'test',
      userId: 'user',
      skipAccountPermission: true,
      dryRun,
      batch: { externalPtrId: 'parent-15', trDocs: docs },
    });
  return { rows, raw, doc, run, bulkWrite, deleteMany, createPTransaction };
};

beforeEach(() => {
  jest.mocked(sendTRPCMessage).mockResolvedValue([
    { _id: 'old', email: 'old@example.com' },
    { _id: 'new', email: 'new@example.com' },
    { _id: 'other', email: 'other@example.com' },
  ]);
});
afterEach(() => jest.clearAllMocks());

test('owner-only import resolves codes and writes just a handover/receipt pair, including retries', async () => {
  const { run, rows, createPTransaction, raw } = fixture();
  await run();
  await run();
  expect(createPTransaction).not.toHaveBeenCalled();
  expect(raw.Transactions.updatePTransaction).not.toHaveBeenCalled();
  expect(rows.size).toBe(3);
  const transfers = [...rows.values()].filter((row) => row._id !== 'opening');
  expect(transfers).toEqual([
    expect.objectContaining({
      fixedAssetId: 'asset',
      ownerId: 'old',
      count: 2,
      action: 'handedOver',
    }),
    expect.objectContaining({
      fixedAssetId: 'asset',
      ownerId: 'new',
      count: 2,
      action: 'received',
    }),
  ]);
  expect(transfers.every((row) => !row.transactionId)).toBe(true);
});

test('dry-run validates without writing owner rows or financial transactions', async () => {
  const { run, rows, bulkWrite, deleteMany, createPTransaction } = fixture();
  await run(true);
  expect(rows.size).toBe(1);
  expect(bulkWrite).not.toHaveBeenCalled();
  expect(deleteMany).not.toHaveBeenCalled();
  expect(createPTransaction).not.toHaveBeenCalled();
});

test('mixed parent posts only its financial roots through the ordinary handler', async () => {
  const { run, doc, createPTransaction, rows } = fixture();
  const financial = {
    journal: 'main',
    date: doc.date,
    details: [{ accountId: '2001', amount: 50 }],
  };
  await run(false, [doc, financial]);
  expect(createPTransaction).toHaveBeenCalledWith(
    [expect.objectContaining({ journal: 'main' })],
    'user',
    { skipAccountPermission: true },
  );
  expect(rows.size).toBe(3);
});

test('insufficient source balance fails before any write', async () => {
  const { run, doc, bulkWrite, createPTransaction } = fixture();
  doc.details[0].count = 4;
  doc.extraData = {
    ...doc.extraData,
    fxaOwnerRecords: [
      {
        transactionDetailId: 'erkhet-record-1',
        count: 4,
        sourceOwnerId: 'old@example.com',
        ownerId: 'new@example.com',
      },
    ],
  };
  await expect(run()).rejects.toThrow('enough fixed asset count');
  expect(bulkWrite).not.toHaveBeenCalled();
  expect(createPTransaction).not.toHaveBeenCalled();
});

test('editing a transfer cannot strand a later handover from its former destination', async () => {
  const { run, doc, rows } = fixture();
  await run();
  rows.set('later', {
    _id: 'later',
    fixedAssetId: 'asset',
    code: '',
    ownerId: 'new',
    count: 2,
    action: 'handedOver',
    status: 'active',
  });
  doc.extraData = {
    ...doc.extraData,
    fxaOwnerRecords: [
      {
        transactionDetailId: 'erkhet-record-1',
        count: 2,
        sourceOwnerId: 'old@example.com',
        ownerId: 'other@example.com',
      },
    ],
  };
  await expect(run()).rejects.toThrow('Later owner movements');
  expect([...rows.values()].some((row) => row.ownerId === 'other')).toBe(false);
});

test('a marked owner-only payload cannot hide a location or cost movement', async () => {
  const { run, doc, bulkWrite } = fixture();
  doc.details[0].amount = 100;
  await expect(run()).rejects.toThrow('unchanged location');
  expect(bulkWrite).not.toHaveBeenCalled();
});
