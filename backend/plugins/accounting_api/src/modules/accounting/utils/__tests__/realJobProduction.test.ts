import { IModels } from '~/connectionResolvers';
import { IJobDocument } from '../../../inventories/@types/jobs';
import { getExecutionProductUnits } from '../../../inventories/utils/jobExecutionUnits';
import { ITransaction, ITransactionDocument } from '../../@types/transaction';
import { activeCost } from '../inventories';
import {
  prepareRealJobProduction,
  syncRealJobProduction,
  removeRealJobProduction,
  REAL_JOB_FOLLOW_TYPES,
} from '../realJobProduction';
import { assertCanWriteTransactionAccounts } from '../trPermissions';
import {
  createOrUpdateTr,
  syncProductsInventory,
  removeSyncProductsInventory,
} from '../utils';
import { commonSave } from '../commonSave';
import { commonRemove } from '../commonRemove';
import InvSaleOutCostTrs from '../invSale';

jest.mock('../inventories', () => ({ activeCost: jest.fn() }));
jest.mock('../trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn(),
}));
jest.mock('../utils', () => ({
  ...jest.requireActual<typeof import('../utils')>('../utils'),
  createOrUpdateTr: jest.fn(),
  syncProductsInventory: jest.fn(),
  removeSyncProductsInventory: jest.fn(),
}));
jest.mock('../../../inventories/utils/jobExecutionUnits', () => ({
  ...jest.requireActual<
    typeof import('../../../inventories/utils/jobExecutionUnits')
  >('../../../inventories/utils/jobExecutionUnits'),
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

  it('skips jobs and follows when available inventory covers the quantity', async () => {
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
        .filter((row) => row.originType === REAL_JOB_FOLLOW_TYPES.COST)
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
            row.originType === REAL_JOB_FOLLOW_TYPES.COST ||
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

  it('creates exactly two inventory follows when the job has no extra costs', async () => {
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
    expect(result.docs.map((row) => row.originType)).toEqual([
      REAL_JOB_FOLLOW_TYPES.OUT,
      REAL_JOB_FOLLOW_TYPES.INCOME,
    ]);
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

  it('rejects denied production cost accounts before persisting a source', async () => {
    const { models } = setup();
    jest
      .mocked(assertCanWriteTransactionAccounts)
      .mockRejectedValueOnce(new Error('Account write permission denied'));
    await expect(
      commonSave('tenant', models, 'user', source()),
    ).rejects.toThrow('Account write permission denied');
    expect(createOrUpdateTr).not.toHaveBeenCalled();
    expect(syncProductsInventory).not.toHaveBeenCalled();
  });

  it('excludes the old sale movement and production group when recalculating edits', async () => {
    const old = document(source(), 'source');
    const previous = [
      document(
        {
          ...source(),
          originType: REAL_JOB_FOLLOW_TYPES.INCOME,
          originId: 'source',
        },
        'old-income',
      ),
      document(
        { ...source(), originType: 'invSaleOut', originId: 'source' },
        'old-sale-out',
      ),
    ];
    const { models } = setup(recipe(), previous);
    const result = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
      old,
    );
    expect(activeCost).toHaveBeenCalledWith(
      models,
      'inventory',
      'branch',
      'department',
      ['output'],
      ['source', 'old-income', 'old-sale-out'],
    );
    expect(result.previous.map((row) => row._id)).toEqual(['old-income']);
  });

  it('preserves transaction and detail ids on resave, links all follows to the source, and reverses removed rows', async () => {
    const { models } = setup();
    const production = await prepareRealJobProduction(
      'tenant',
      models,
      'user',
      source(),
    );
    const root = document(source(), 'source');
    const first = await syncRealJobProduction(
      'tenant',
      models,
      'user',
      root,
      production,
    );
    expect(
      first.every(
        (row) =>
          row.parentId === 'parent' &&
          row.originId === 'source' &&
          row.ptrId === first[0].ptrId,
      ),
    ).toBe(true);
    expect(first[0].ptrId).not.toBe(root.ptrId);
    const second = await syncRealJobProduction('tenant', models, 'user', root, {
      ...production,
      previous: first,
    });
    expect(second.map((row) => row._id)).toEqual(first.map((row) => row._id));
    expect(
      second.map((row) => row.details.map((detail) => detail._id)),
    ).toEqual(first.map((row) => row.details.map((detail) => detail._id)));
    await syncRealJobProduction('tenant', models, 'user', root, {
      details: [],
      docs: [],
      previous: second,
    });
    expect(removeSyncProductsInventory).toHaveBeenCalledTimes(2);
    expect(models.Transactions.deleteMany).toHaveBeenCalledWith({
      _id: { $in: second.map((row) => row._id) },
    });
  });

  it('wires invOut saves through production and returns the generated rows for TBalance', async () => {
    const { models } = setup();
    const result = await commonSave('tenant', models, 'user', source());
    expect(result.otherTrs).toHaveLength(4);
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user',
      expect.objectContaining({
        journal: 'invOut',
        details: [expect.objectContaining({ count: 5, amount: 47 })],
      }),
      undefined,
    );
    expect(syncProductsInventory).toHaveBeenCalledTimes(3);
  });

  it('uses sale-out inventory accounts and leaves sale revenue unchanged', async () => {
    const { models } = setup();
    const doc: ITransaction = {
      ...source(),
      journal: 'invSale',
      followInfos: {
        saleOutAccountId: 'inventory',
        saleCostAccountId: 'sale-cost',
      },
      details: [
        {
          accountId: 'revenue',
          productId: 'output',
          count: 5,
          unitPrice: 100,
          amount: 500,
        },
      ],
    };
    const result = await commonSave('tenant', models, 'user', doc);
    expect(createOrUpdateTr).toHaveBeenCalledWith(
      models,
      'user',
      expect.objectContaining({
        journal: 'invSale',
        details: [expect.objectContaining({ amount: 500 })],
      }),
      undefined,
    );
    expect(
      result.otherTrs.find((row) => row.journal === 'invSaleOut')?.details[0],
    ).toMatchObject({ accountId: 'inventory', count: 5, amount: 47 });
    expect(
      result.otherTrs.find((row) => row.journal === 'invSaleCost')?.details[0],
    ).toMatchObject({ accountId: 'sale-cost', amount: 47 });
    expect(
      result.otherTrs.filter(
        (row) => row.originType === REAL_JOB_FOLLOW_TYPES.INCOME,
      ),
    ).toHaveLength(1);
  });

  it.each([2, 5])(
    'lets the sale handler resolve stock and return its own follows for quantity %i',
    async (count) => {
      const { models } = setup();
      const sale = document(
        {
          ...source([count]),
          journal: 'invSale',
          followInfos: {
            saleOutAccountId: 'inventory',
            saleCostAccountId: 'sale-cost',
          },
          details: [
            {
              accountId: 'revenue',
              productId: 'output',
              count,
              amount: count * 100,
            },
          ],
        },
        'sale-source',
      );
      const handler = new InvSaleOutCostTrs('tenant', models, 'user', sale);
      await handler.checkValidation();
      const follows = await handler.doTrs(sale);
      expect(follows.slice(0, 2).map((row) => row.journal)).toEqual([
        'invSaleOut',
        'invSaleCost',
      ]);
      expect(follows).toHaveLength(count === 2 ? 2 : 6);
      expect(follows[0].details[0].amount).toBe(count === 2 ? 20 : 47);
      expect(follows.every((row) => row.originId === sale._id)).toBe(true);
      expect(activeCost).toHaveBeenCalledWith(
        models,
        'inventory',
        'branch',
        'department',
        ['output'],
        ['sale-source'],
      );
      expect(sale.details[0].amount).toBe(count * 100);
    },
  );

  it('reverses production when the source is removed, but not again for a generated row', async () => {
    const generated = document(
      { ...source(), originType: REAL_JOB_FOLLOW_TYPES.INCOME },
      'income',
    );
    const { models } = setup(recipe(), [generated]);
    await commonRemove('tenant', models, document(source(), 'source'));
    expect(removeSyncProductsInventory).toHaveBeenCalledTimes(2);
    jest.mocked(removeSyncProductsInventory).mockClear();
    await commonRemove('tenant', models, generated);
    expect(removeSyncProductsInventory).not.toHaveBeenCalled();
    await removeRealJobProduction('tenant', models, 'source');
    expect(removeSyncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      generated,
      1,
    );
  });

  it('reverses both production and the generated sale movement on source removal', async () => {
    const income = document(
      {
        ...source(),
        originId: 'source',
        originType: REAL_JOB_FOLLOW_TYPES.INCOME,
      },
      'income',
    );
    const saleOut = document(
      {
        ...source(),
        journal: 'invSaleOut',
        originId: 'source',
        originType: 'invSaleOut',
      },
      'sale-out',
    );
    const { models } = setup(recipe(), [income, saleOut]);
    await commonRemove(
      'tenant',
      models,
      document({ ...source(), journal: 'invSale' }, 'source'),
    );
    expect(removeSyncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      income,
      1,
    );
    expect(removeSyncProductsInventory).toHaveBeenCalledWith(
      'tenant',
      saleOut,
      -1,
    );
    expect(removeSyncProductsInventory).toHaveBeenCalledTimes(2);
  });
});
