import { IModels } from '~/connectionResolvers';
import { ITrDetail } from '../../../accounting/@types/transaction';
import { fixOutTrs } from '../../../accounting/utils/inventories';
import { reallocateJobExecutionIncome } from '../jobExecutionAdjustment';

const setup = () => {
  const execution = {
    _id: 'execution',
    parentId: 'parent',
    status: 'posted',
    date: new Date('2026-10-21T00:00:00Z'),
    inputAccountId: 'raw',
    inputBranchId: 'ib',
    inputDepartmentId: 'id',
    outputAccountId: 'finished',
    outputBranchId: 'ob',
    outputDepartmentId: 'od',
    jobs: [
      {
        _id: 'j1',
        jobId: 'job1',
        quantity: 1,
        inputs: [{ productId: 'raw-product', quantity: 1 }],
        outputs: [
          { productId: 'a', quantity: 1, costRatio: 1 },
          { productId: 'b', quantity: 1, costRatio: 1 },
        ],
        laborCosts: [{ name: 'Labour', accountId: 'labour', amount: 10 }],
        overheadCosts: [],
      },
      {
        _id: 'j2',
        jobId: 'job2',
        quantity: 1,
        inputs: [{ productId: 'raw-product', quantity: 2 }],
        outputs: [
          { productId: 'a', quantity: 1, costRatio: 2 },
          { productId: 'c', quantity: 1, costRatio: 1 },
        ],
        laborCosts: [],
        overheadCosts: [{ name: 'Power', accountId: 'power', amount: 10 }],
      },
    ],
  };
  const common = {
    parentId: 'parent',
    ptrId: 'ptr',
    contentType: 'jobExecution',
    contentId: 'execution',
  };
  const outgoing = {
    ...common,
    _id: 'out',
    journal: 'invOut',
    side: 'ct',
    sumDt: 0,
    sumCt: 30,
    branchId: 'ib',
    departmentId: 'id',
    details: [
      {
        _id: 'raw-detail',
        accountId: 'raw',
        productId: 'raw-product',
        count: 3,
        unitPrice: 10,
        amount: 30,
      },
    ],
  };
  const income = {
    ...common,
    _id: 'income',
    journal: 'invIncome',
    side: 'dt',
    sumDt: 50,
    sumCt: 0,
    branchId: 'ob',
    departmentId: 'od',
    details: [
      {
        _id: 'a-detail',
        accountId: 'finished',
        productId: 'a',
        count: 2,
        unitPrice: 15,
        amount: 30,
      },
      {
        _id: 'b-detail',
        accountId: 'finished',
        productId: 'b',
        count: 1,
        unitPrice: 10,
        amount: 10,
      },
      {
        _id: 'c-detail',
        accountId: 'finished',
        productId: 'c',
        count: 1,
        unitPrice: 10,
        amount: 10,
      },
    ],
  };
  const credit = {
    ...common,
    _id: 'credit',
    journal: 'main',
    side: 'ct',
    details: [
      { accountId: 'labour', amount: 10 },
      { accountId: 'power', amount: 10 },
    ],
  };
  const updateOne = jest.fn().mockImplementation(
    async (
      { _id }: { _id: string },
      {
        $set,
      }: {
        $set: {
          details?: ITrDetail[];
          sumDt?: number;
          sumCt?: number;
          'details.$[d].amount'?: number;
          'details.$[d].unitPrice'?: number;
        };
      },
    ) => {
      if (_id === 'out') {
        outgoing.details[0].amount =
          $set['details.$[d].amount'] ?? outgoing.details[0].amount;
        outgoing.details[0].unitPrice =
          $set['details.$[d].unitPrice'] ?? outgoing.details[0].unitPrice;
        outgoing.sumCt = $set.sumCt ?? outgoing.sumCt;
      } else if (_id === 'income' && $set.details) {
        income.details = $set.details.map((detail) => ({
          _id: detail._id ?? '',
          accountId: detail.accountId,
          productId: detail.productId ?? '',
          count: detail.count ?? 0,
          unitPrice: detail.unitPrice ?? 0,
          amount: detail.amount,
        }));
        income.sumDt = $set.sumDt ?? income.sumDt;
      }
    },
  );
  const cacheDelta = jest.fn().mockResolvedValue(undefined);
  const cacheOut = jest.fn().mockResolvedValue(undefined);
  const models = {
    JobExecutions: {
      findOne: jest
        .fn()
        .mockReturnValue({ lean: jest.fn().mockResolvedValue(execution) }),
    },
    Transactions: {
      find: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue([outgoing, income, credit]),
      }),
      updateOne,
      updateMany: jest.fn().mockResolvedValue(undefined),
      checkPtr: jest.fn().mockResolvedValue(undefined),
    },
    AdjustInvDetails: {
      getAdjustInvDetail: jest
        .fn()
        .mockResolvedValue({ _id: 'cache', remainder: 10, cost: 200 }),
      updateAdjustInvDetail: cacheOut,
      increaseAdjustInvDetail: cacheDelta,
    },
  };
  return {
    models: models as unknown as IModels,
    rawModels: models,
    outgoing,
    income,
    credit,
    cacheDelta,
    cacheOut,
    updateOne,
  };
};

test('inventory out adjustment reprices execution income per job and updates cached output costs without changing quantities or credits', async () => {
  const { models, rawModels, outgoing, income, credit, cacheDelta, cacheOut } =
    setup();
  const creditBefore = JSON.stringify(credit);
  await fixOutTrs('tenant', models, {
    adjustId: 'adjust',
    outAggrs: [
      {
        _id: {
          accountId: 'raw',
          branchId: 'ib',
          departmentId: 'id',
          productId: 'raw-product',
        },
        records: [
          { ...outgoing, details: { ...outgoing.details[0] } },
        ] as never,
      },
    ],
  });
  expect(outgoing.details[0].amount).toBe(60);
  expect(income.details.map((row) => [row._id, row.count, row.amount])).toEqual(
    [
      ['a-detail', 2, 48.3333],
      ['b-detail', 1, 15],
      ['c-detail', 1, 16.6667],
    ],
  );
  expect(income.sumDt).toBe(80);
  expect(income.details[0].unitPrice).toBe(48.3333 / 2);
  expect(JSON.stringify(credit)).toBe(creditBefore);
  expect(
    cacheDelta.mock.calls.map(([params]) => [
      params.productId,
      params.count,
      params.amount,
    ]),
  ).toEqual([
    ['a', 0, 18.3333],
    ['b', 0, 5],
    ['c', 0, 6.6667],
  ]);
  expect(cacheOut.mock.invocationCallOrder[0]).toBeLessThan(
    cacheDelta.mock.invocationCallOrder[0],
  );
  expect(rawModels.Transactions.checkPtr).toHaveBeenCalledWith('ptr');
  expect(rawModels.Transactions.find).toHaveBeenCalledWith({
    parentId: 'parent',
    contentType: 'jobExecution',
    contentId: 'execution',
  });
  const calls = cacheDelta.mock.calls.length;
  await expect(
    reallocateJobExecutionIncome(models, {
      adjustId: 'adjust',
      parentId: 'parent',
      contentId: 'execution',
    }),
  ).resolves.toEqual([]);
  expect(cacheDelta).toHaveBeenCalledTimes(calls);
});

test('decreased input costs reduce output and cached costs using the same saved ratios', async () => {
  const { models, outgoing, income, cacheDelta } = setup();
  outgoing.details[0].amount = 15;
  outgoing.details[0].unitPrice = 5;
  await reallocateJobExecutionIncome(models, {
    adjustId: 'adjust',
    parentId: 'parent',
    contentId: 'execution',
  });
  expect(income.sumDt).toBe(35);
  expect(income.details.map((detail) => detail.amount)).toEqual([
    20.8333, 7.5, 6.6667,
  ]);
  expect(cacheDelta.mock.calls.map(([params]) => params.amount)).toEqual([
    -9.1667, -2.5, -3.3333,
  ]);
});

test('an adjustment retry repairs stale income even when its outgoing cost already matches', async () => {
  const { models, outgoing, income, cacheDelta } = setup();
  outgoing.details[0].amount = 60;
  outgoing.details[0].unitPrice = 20;
  outgoing.sumCt = 60;
  await fixOutTrs('tenant', models, {
    adjustId: 'adjust',
    outAggrs: [
      {
        _id: {
          accountId: 'raw',
          branchId: 'ib',
          departmentId: 'id',
          productId: 'raw-product',
        },
        records: [
          { ...outgoing, details: { ...outgoing.details[0] } },
        ] as never,
      },
    ],
  });
  expect(income.sumDt).toBe(80);
  expect(cacheDelta).toHaveBeenCalledTimes(3);
});

test('mismatched saved quantities fail before updating income or its cache', async () => {
  const { models, outgoing, updateOne, cacheDelta } = setup();
  outgoing.details[0].count = 99;
  await expect(
    reallocateJobExecutionIncome(models, {
      adjustId: 'adjust',
      parentId: 'parent',
      contentId: 'execution',
    }),
  ).rejects.toThrow('do not match saved actuals');
  expect(updateOne).not.toHaveBeenCalled();
  expect(cacheDelta).not.toHaveBeenCalled();
});

test('missing execution and missing income never silently leave an unbalanced parent', async () => {
  const { models, rawModels, updateOne } = setup();
  rawModels.JobExecutions.findOne.mockReturnValueOnce({
    lean: jest.fn().mockResolvedValue(null),
  });
  await expect(
    reallocateJobExecutionIncome(models, {
      adjustId: 'adjust',
      parentId: 'parent',
      contentId: 'execution',
    }),
  ).rejects.toThrow('not found');
  rawModels.Transactions.find.mockReturnValueOnce({
    lean: jest.fn().mockResolvedValue([]),
  });
  await expect(
    reallocateJobExecutionIncome(models, {
      adjustId: 'adjust',
      parentId: 'parent',
      contentId: 'execution',
    }),
  ).rejects.toThrow('group is invalid');
  expect(updateOne).not.toHaveBeenCalled();
});
