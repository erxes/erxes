import { IModels } from '~/connectionResolvers';
import { IJobDocument } from '@/inventories/@types/jobs';
import { getExecutionProductUnits } from '@/inventories/utils/jobExecutionUnits';
import {
  ITransaction,
  ITransactionDocument,
} from '@/accounting/@types/transaction';
import { activeCost } from '@/accounting/utils/inventories';
import { prepareRealJobProduction } from '../realJobProduction';
import { assertCanWriteTransactionAccounts } from '@/accounting/utils/trPermissions';
import { createOrUpdateTr } from '@/accounting/utils/utils';
import { commonSave } from '@/accounting/utils/commonSave';

jest.mock('@/accounting/utils/inventories', () => ({ activeCost: jest.fn() }));
jest.mock('@/accounting/utils/trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn(),
}));
jest.mock('@/accounting/utils/utils', () => ({
  ...jest.requireActual<typeof import('@/accounting/utils/utils')>(
    '@/accounting/utils/utils',
  ),
  createOrUpdateTr: jest.fn(),
  syncProductsInventory: jest.fn(),
  removeSyncProductsInventory: jest.fn(),
}));
jest.mock('@/inventories/utils/jobExecutionUnits', () => ({
  ...jest.requireActual<typeof import('@/inventories/utils/jobExecutionUnits')>(
    '@/inventories/utils/jobExecutionUnits',
  ),
  getExecutionProductUnits: jest.fn(),
}));

const document = (doc: ITransaction, id: string): ITransactionDocument =>
  ({
    ...doc,
    _id: id,
    parentId: doc.parentId || 'parent',
    ptrId: doc.ptrId || 'root-pointer',
    number: 'number',
  } as ITransactionDocument);

const source = (counts = [5]): ITransaction => ({
  date: new Date('2026-10-22T04:00:00Z'),
  status: 'complete',
  journal: 'invOut',
  branchId: 'branch',
  departmentId: 'department',
  details: counts.map((count, index) => ({
    _id: `detail-${index}`,
    accountId: 'inventory',
    productId: 'output',
    count,
    unitPrice: 999,
    amount: count * 999,
  })),
});

const recipe = (): IJobDocument =>
  ({
    _id: 'latest-job',
    name: 'Real job',
    status: 'active',
    durationType: 'real',
    inputs: [{ productId: 'material', quantity: 2, uom: 'unit' }],
    outputs: [{ productId: 'output', quantity: 1, uom: 'unit', costRatio: 1 }],
    laborCosts: [{ name: 'Labor', amount: 2, accountId: 'labor' }],
    overheadCosts: [{ name: 'Overhead', amount: 1, accountId: 'overhead' }],
  } as IJobDocument);

const setup = (
  template: IJobDocument | null = recipe(),
  previous: ITransactionDocument[] = [],
) => {
  const sort = jest
    .fn()
    .mockReturnValue({ lean: jest.fn().mockResolvedValue(template) });
  const jobs = { findOne: jest.fn().mockReturnValue({ sort }) };
  const models = {
    Jobs: jobs,
    Configs: { getConfigValue: jest.fn().mockResolvedValue(false) },
    Accounts: {
      getAccount: jest
        .fn()
        .mockImplementation(async ({ _id }: { _id: string }) => ({
          _id,
          journal: _id === 'inventory' ? 'inventory' : 'main',
          currency: 'MNT',
        })),
      find: jest
        .fn()
        .mockResolvedValue([{ _id: 'inventory' }, { _id: 'sale-cost' }]),
    },
    Transactions: {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(previous),
        sort: jest
          .fn()
          .mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
      }),
      getTransaction: jest
        .fn()
        .mockImplementation(async ({ _id }: { _id: string }) => ({ _id })),
      deleteMany: jest.fn(),
    },
  };
  jest
    .mocked(activeCost)
    .mockImplementation(
      async (_models, _account, _branch, _department, ids = []) =>
        Object.fromEntries(
          ids.map((id) => [
            id,
            id === 'output'
              ? { remainder: 2, totalCost: 20, unitCost: 10 }
              : { remainder: 100, totalCost: 300, unitCost: 3 },
          ]),
        ),
    );
  jest.mocked(getExecutionProductUnits).mockResolvedValue({
    products: [
      { _id: 'output', uom: 'unit' },
      { _id: 'material', uom: 'unit', subUoms: [{ uom: 'pack', ratio: 10 }] },
      { _id: 'byproduct', uom: 'unit' },
    ],
    units: [],
  });
  let sequence = 0;
  jest
    .mocked(createOrUpdateTr)
    .mockImplementation(async (_models, _user, doc, old) =>
      document(doc, old?._id || `generated-${++sequence}`),
    );
  return { models: models as unknown as IModels, raw: models, sort, jobs };
};

describe('real job shortage production', () => {
  beforeEach(() => jest.clearAllMocks());

  it.each(['invOut', 'invSale'])(
    'does not auto-produce for a manual %s even with a linked sales content type',
    async (journal) => {
      const { models } = setup();
      const doc: ITransaction = {
        ...source(),
        journal,
        contentType: 'sales:deal',
        contentId: 'deal',
        followInfos: {
          saleOutAccountId: 'inventory',
          saleCostAccountId: 'sale-cost',
          allowRealJobProduction: true,
        },
      };
      const result = await commonSave('tenant', models, 'user', doc);
      expect(result.otherTrs).toHaveLength(journal === 'invSale' ? 2 : 0);
      expect(models.Jobs.findOne).not.toHaveBeenCalled();
      expect(getExecutionProductUnits).not.toHaveBeenCalled();
      expect(assertCanWriteTransactionAccounts).not.toHaveBeenCalled();
      const inventory = jest
        .mocked(createOrUpdateTr)
        .mock.calls.find(
          (call) =>
            call[2].journal === 'invOut' || call[2].journal === 'invSaleOut',
        );
      expect(inventory?.[2].details[0]).toMatchObject({
        count: 5,
        unitPrice: 10,
        amount: 50,
      });
    },
  );

  it('preserves location-aware sale cost pricing without changing revenue or running jobs', async () => {
    const { models } = setup();
    const doc: ITransaction = {
      ...source([2, 3]),
      journal: 'invSale',
      followInfos: {
        saleOutAccountId: 'inventory',
        saleCostAccountId: 'sale-cost',
      },
    };
    doc.details[1].branchId = 'other-branch';
    doc.details[1].departmentId = 'other-department';
    jest
      .mocked(activeCost)
      .mockImplementation(async (_models, _account, branch) => ({
        output: {
          remainder: 10,
          totalCost: 100,
          unitCost: branch === 'other-branch' ? 7 : 10,
        },
      }));
    const result = await commonSave('tenant', models, 'user', doc);
    const revenue = jest
      .mocked(createOrUpdateTr)
      .mock.calls.find((call) => call[2].journal === 'invSale');
    expect(revenue?.[2].details.map((row) => row.amount)).toEqual([1998, 2997]);
    const out = result.otherTrs?.find((row) => row.journal === 'invSaleOut');
    expect(out?.details).toEqual([
      expect.objectContaining({
        count: 2,
        amount: 20,
        branchId: 'branch',
        departmentId: 'department',
      }),
      expect.objectContaining({
        count: 3,
        amount: 21,
        branchId: 'other-branch',
        departmentId: 'other-department',
      }),
    ]);
    expect(models.Jobs.findOne).not.toHaveBeenCalled();
  });

  it('skips production when available inventory covers the quantity', async () => {
    const { models, jobs } = setup();
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source([2]),
    );
    expect(result.docs).toEqual([]);
    expect(result.details[0]).toMatchObject({
      count: 2,
      unitPrice: 10,
      amount: 20,
    });
    expect(jobs.findOne).not.toHaveBeenCalled();
    expect(getExecutionProductUnits).not.toHaveBeenCalled();
  });

  it('produces only the shortage with the latest active real job and blends its full cost', async () => {
    const { models, sort, jobs } = setup();
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
    );
    expect(jobs.findOne).toHaveBeenCalledWith({
      status: 'active',
      durationType: 'real',
      'outputs.productId': 'output',
    });
    expect(sort).toHaveBeenCalledWith({ modifiedAt: -1, _id: -1 });
    expect(result.details[0]).toMatchObject({
      count: 5,
      amount: 47,
      unitPrice: 9.4,
    });
    expect(result.docs).toHaveLength(4);
    expect(
      result.docs.find((row) => row.journal === 'invOut')?.details[0],
    ).toMatchObject({ productId: 'material', count: 6, amount: 18 });
    expect(
      result.docs.find((row) => row.journal === 'invIncome')?.details[0],
    ).toMatchObject({ productId: 'output', count: 3, amount: 27 });
    expect(
      result.docs
        .filter(
          (row) => row.journal !== 'invOut' && row.journal !== 'invIncome',
        )
        .map((row) => row.details[0].amount),
    ).toEqual([6, 3]);
    expect(
      result.docs.every(
        (row) => row.branchId === 'branch' && row.departmentId === 'department',
      ),
    ).toBe(true);
    expect(
      result.docs.every((row) =>
        row.details.every(
          (detail) =>
            (row.journal !== 'invOut' && row.journal !== 'invIncome') ||
            detail.accountId === 'inventory',
        ),
      ),
    ).toBe(true);
    expect(result.docs.some((row) => row.contentType === 'jobExecution')).toBe(
      false,
    );
    expect(assertCanWriteTransactionAccounts).toHaveBeenCalled();
  });

  it('accounts for repeated demand and consolidates production products', async () => {
    const { models } = setup();
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source([3, 2]),
    );
    expect(result.details.map((row) => row.amount)).toEqual([29, 18]);
    expect(result.docs.filter((row) => row.journal === 'invOut')).toHaveLength(
      1,
    );
    expect(
      result.docs.find((row) => row.journal === 'invIncome')?.details,
    ).toEqual([
      expect.objectContaining({ productId: 'output', count: 3, amount: 27 }),
    ]);
  });

  it('converts recipe sub-UOMs before scaling the missing base-unit output', async () => {
    const job = recipe();
    job.inputs[0].uom = 'pack';
    job.outputs[0].quantity = 2;
    const { models } = setup(job);
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
    );
    expect(
      result.docs.find((row) => row.journal === 'invOut')?.details[0],
    ).toMatchObject({ count: 30, amount: 90 });
    expect(
      result.docs.find((row) => row.journal === 'invIncome')?.details[0],
    ).toMatchObject({ count: 3, amount: 94.5 });
  });

  it('uses all outputs and raw ratios and does not manufacture an already supplied coproduct again', async () => {
    const job = recipe();
    job.outputs.push({ productId: 'byproduct', quantity: 1, costRatio: 2 });
    const { models } = setup(job);
    const doc = source();
    doc.details.push({
      accountId: 'inventory',
      productId: 'byproduct',
      count: 1,
      amount: 0,
    });
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      doc,
    );
    expect(
      result.docs.find((row) => row.journal === 'invIncome')?.details,
    ).toEqual([
      expect.objectContaining({ productId: 'output', amount: 9 }),
      expect.objectContaining({ productId: 'byproduct', amount: 18 }),
    ]);
    expect(models.Jobs.findOne).toHaveBeenCalledTimes(1);
  });

  it('keeps normal active-cost behavior when no active real recipe matches', async () => {
    const { models } = setup(null);
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
    );
    expect(result.docs).toEqual([]);
    expect(result.details[0].amount).toBe(50);
  });

  it('creates exactly two inventory roots when the job has no extra costs', async () => {
    const job = recipe();
    job.laborCosts = [];
    job.overheadCosts = [];
    const { models } = setup(job);
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
    );
    expect(result.docs.map((row) => row.journal)).toEqual([
      'invOut',
      'invIncome',
    ]);
    expect(result.docs.every((row) => !row.originId && !row.originType)).toBe(
      true,
    );
    expect(result.details[0].amount).toBe(38);
  });

  it('keeps distinct detail-level locations in separate production groups', async () => {
    const { models } = setup();
    const doc = source([5, 5]);
    doc.details[1].branchId = 'other-branch';
    doc.details[1].departmentId = 'other-department';
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      doc,
    );
    expect(
      result.docs
        .filter((row) => row.journal === 'invIncome')
        .map((row) => [row.branchId, row.departmentId]),
    ).toEqual([
      ['branch', 'department'],
      ['other-branch', 'other-department'],
    ]);
    expect(activeCost).toHaveBeenCalledWith(
      models,
      'inventory',
      'other-branch',
      'other-department',
      ['output'],
      [],
    );
  });

  it('validates production permissions before any write', async () => {
    const { models } = setup();
    jest
      .mocked(assertCanWriteTransactionAccounts)
      .mockRejectedValueOnce(new Error('Denied'));
    await expect(
      prepareRealJobProduction('tenant', models, 'user', source()),
    ).rejects.toThrow('Denied');
    expect(createOrUpdateTr).not.toHaveBeenCalled();
  });

  it('excludes the entire previous group when planning a resync', async () => {
    const { models } = setup();
    const excluded = ['sale', 'old-income', 'old-out', 'old-sale-out'];
    await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
      excluded,
    );
    expect(activeCost).toHaveBeenCalledWith(
      models,
      'inventory',
      'branch',
      'department',
      ['output'],
      excluded,
    );
  });
});
