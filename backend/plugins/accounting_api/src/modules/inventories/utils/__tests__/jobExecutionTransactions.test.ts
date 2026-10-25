import {
  buildJobExecutionTransactions as buildTransactions,
  matchExecutionTransactionIds,
} from '../jobExecutionTransactions';
import {
  IExecutionProduct,
  IExecutionUnit,
  executionBaseQuantity,
  executionJobsInBaseUnits,
} from '../jobExecutionUnits';
import { IJobExecution, IJobExecutionItem } from '../../@types/jobExecutions';

type SingleJobFixture = Omit<IJobExecution, 'jobs'> & IJobExecutionItem;
const buildJobExecutionTransactions = (
  job: SingleJobFixture,
  products: IExecutionProduct[],
  costs: Record<string, { unitCost: number }>,
  journals: ReadonlyMap<string, string>,
  units: IExecutionUnit[] = [],
) =>
  buildTransactions(
    { ...job, jobs: executionJobsInBaseUnits([job], products, units) },
    costs,
    journals,
  );

const execution: SingleJobFixture = {
  _id: 'execution',
  date: new Date('2026-10-19T01:00:00Z'),
  jobId: 'card',
  quantity: 1,
  inputAccountId: 'raw',
  inputBranchId: 'source',
  inputDepartmentId: 'source-dept',
  outputAccountId: 'finished',
  outputBranchId: 'target',
  outputDepartmentId: 'target-dept',
  inputs: [{ productId: 'raw-product', uom: 'box', quantity: 2 }],
  outputs: [
    { productId: 'a', quantity: 1, costRatio: 1 },
    { productId: 'b', quantity: 1, costRatio: 1 },
    { productId: 'c', quantity: 2, costRatio: 2 },
  ],
  laborCosts: [{ name: 'Labor', amount: 30, accountId: 'labor' }],
  overheadCosts: [{ name: 'Power', amount: 10, accountId: 'power' }],
};
const products = [
  { _id: 'raw-product', uom: 'each', subUoms: [{ uom: 'box', ratio: 5 }] },
  { _id: 'a' },
  { _id: 'b' },
  { _id: 'c' },
];
const journals = new Map([
  ['labor', 'payable'],
  ['power', 'bank'],
]);

test('allocates material, labor and overhead by raw output ratios and balances the group', () => {
  const docs = buildJobExecutionTransactions(
    execution,
    products,
    { 'raw-product': { unitCost: 6 } },
    journals,
  );
  expect(docs.map((doc) => doc.journal)).toEqual([
    'invOut',
    'invIncome',
    'payable',
    'bank',
  ]);
  expect(docs[0]).toMatchObject({
    side: 'ct',
    branchId: 'source',
    departmentId: 'source-dept',
    details: [{ accountId: 'raw', count: 10, unitPrice: 6, amount: 60 }],
  });
  expect(docs[1]).toMatchObject({
    side: 'dt',
    branchId: 'target',
    departmentId: 'target-dept',
  });
  expect(docs[1].details.map((row) => row.amount)).toEqual([25, 25, 50]);
  expect(docs[1].details.map((row) => row.unitPrice)).toEqual([25, 25, 25]);
  const balance = docs.reduce(
    (sum, doc) =>
      sum +
      (doc.side === 'dt' ? 1 : -1) *
        doc.details.reduce((amount, row) => amount + row.amount, 0),
    0,
  );
  expect(balance).toBe(0);
  expect(
    docs.every(
      (doc) =>
        doc.contentId === 'execution' &&
        doc.contentType === 'jobExecution' &&
        doc.status === 'complete',
    ),
  ).toBe(true);
});

test('cumulative allocation avoids negative last rows at small rounding boundaries', () => {
  const tiny = {
    ...execution,
    inputs: [{ productId: 'a', quantity: 1 }],
    outputs: Array.from({ length: 10 }, () => ({
      productId: 'a',
      quantity: 1,
      costRatio: 1,
    })),
    laborCosts: [],
    overheadCosts: [],
  };
  const docs = buildJobExecutionTransactions(
    tiny,
    products,
    { a: { unitCost: 0.0006 } },
    new Map(),
  );
  const amounts = docs[1].details.map((row) => row.amount);
  expect(amounts.every((amount) => amount >= 0)).toBe(true);
  expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBeCloseTo(
    0.0006,
    10,
  );
});

test('output additional units also convert to base units without changing allocated cost', () => {
  const docs = buildJobExecutionTransactions(
    {
      ...execution,
      outputs: [
        { productId: 'raw-product', uom: 'box', quantity: 3, costRatio: 1 },
      ],
    },
    products,
    { 'raw-product': { unitCost: 6 } },
    journals,
  );
  expect(docs[1].details[0]).toMatchObject({
    count: 15,
    amount: 100,
    unitPrice: 100 / 15,
  });
});

test('invalid or missing product units cannot silently post a different quantity', () => {
  expect(() => executionBaseQuantity(execution.inputs[0], undefined)).toThrow(
    'Product not found',
  );
  expect(() =>
    executionBaseQuantity(execution.inputs[0], {
      _id: 'raw-product',
      uom: 'each',
    }),
  ).toThrow('Invalid product unit');
  expect(() =>
    executionBaseQuantity(execution.inputs[0], {
      _id: 'raw-product',
      uom: 'each',
      subUoms: [{ uom: 'box', ratio: -1 }],
    }),
  ).toThrow('Invalid product unit');
});

test('resolves platform unit ids and names to the same unit codes as the form', () => {
  const units = [
    { _id: 'main-id', code: 'each', name: 'Each' },
    { _id: 'box-id', code: 'box', name: 'Box' },
  ];
  const product = {
    _id: 'raw-product',
    uom: 'main-id',
    subUoms: [{ uom: 'box-id', ratio: 5 }],
  };
  expect(
    executionBaseQuantity(
      { productId: 'raw-product', uom: 'Each', quantity: 3 },
      product,
      units,
    ),
  ).toBe(3);
  expect(
    executionBaseQuantity(
      { productId: 'raw-product', uom: 'box', quantity: 3 },
      product,
      units,
    ),
  ).toBe(15);
});

test('does not create credit entries for zero-valued costs and rejects all-zero ratios', () => {
  const noCost = {
    ...execution,
    laborCosts: [{ name: 'Free', accountId: 'labor', amount: 0 }],
    overheadCosts: [],
  };
  expect(
    buildJobExecutionTransactions(noCost, products, {}, journals),
  ).toHaveLength(2);
  expect(() =>
    buildJobExecutionTransactions(
      { ...noCost, outputs: [{ productId: 'a', quantity: 1, costRatio: 0 }] },
      products,
      {},
      journals,
    ),
  ).toThrow('positive total');
});

test('merges repeated products after allocating each job cost independently', () => {
  const jobs: IJobExecutionItem[] = [
    {
      _id: 'a',
      jobId: 'job-a',
      quantity: 5,
      inputs: [{ productId: 'raw-product', uom: 'box', quantity: 2 }],
      outputs: [
        { productId: 'a', quantity: 2, costRatio: 1 },
        { productId: 'b', quantity: 1, costRatio: 1 },
      ],
      laborCosts: [{ name: 'Work', accountId: 'labor', amount: 40 }],
      overheadCosts: [],
    },
    {
      _id: 'b',
      jobId: 'job-b',
      quantity: 10,
      inputs: [{ productId: 'raw-product', uom: 'each', quantity: 5 }],
      outputs: [{ productId: 'a', quantity: 3, costRatio: 1 }],
      laborCosts: [],
      overheadCosts: [],
    },
  ];
  const docs = buildTransactions(
    { ...execution, jobs: executionJobsInBaseUnits(jobs, products, []) },
    { 'raw-product': { unitCost: 6 } },
    journals,
  );
  expect(docs.map((doc) => doc.journal)).toEqual([
    'invOut',
    'invIncome',
    'payable',
  ]);
  expect(docs[0].details).toHaveLength(1);
  expect(docs[0].details[0]).toMatchObject({
    productId: 'raw-product',
    count: 15,
    amount: 90,
    unitPrice: 6,
  });
  expect(docs[1].details).toHaveLength(2);
  expect(docs[1].details[0]).toMatchObject({
    productId: 'a',
    count: 5,
    amount: 80,
    unitPrice: 16,
  });
  expect(docs[1].details[1]).toMatchObject({
    productId: 'b',
    count: 1,
    amount: 50,
    unitPrice: 50,
  });
});

test('cumulative input rounding keeps the merged group balanced at fractional boundaries', () => {
  const job: IJobExecutionItem = {
    _id: 'one',
    jobId: 'tiny',
    quantity: 1,
    inputs: [{ productId: 'a', quantity: 0.5 }],
    outputs: [{ productId: 'b', quantity: 1, costRatio: 1 }],
    laborCosts: [],
    overheadCosts: [],
  };
  const docs = buildTransactions(
    { ...execution, jobs: [job, { ...job, _id: 'two' }] },
    { a: { unitCost: 0.0001 } },
    new Map(),
  );
  expect(docs[0].details).toHaveLength(1);
  expect(docs[0].details[0]).toMatchObject({
    count: 1,
    amount: 0.0001,
    unitPrice: 0.0001,
  });
  expect(docs[1].details[0]).toMatchObject({
    count: 2,
    amount: 0.0001,
    unitPrice: 0.00005,
  });
});

test('does not net a product used on both the input and output sides', () => {
  const jobs = [
    {
      ...execution,
      inputs: [{ productId: 'a', quantity: 2 }],
      outputs: [{ productId: 'a', quantity: 1, costRatio: 1 }],
    },
  ];
  const docs = buildTransactions(
    { ...execution, jobs },
    { a: { unitCost: 5 } },
    journals,
  );
  expect(docs[0].details[0]).toMatchObject({
    productId: 'a',
    count: 2,
    amount: 10,
  });
  expect(docs[1].details[0]).toMatchObject({
    productId: 'a',
    count: 1,
    amount: 50,
  });
});

test('transaction generation consumes saved base quantities without unit metadata or ratio conversion', () => {
  const docs = buildTransactions(
    {
      ...execution,
      jobs: [
        {
          ...execution,
          inputs: [{ productId: 'raw-product', uom: 'each', quantity: 10 }],
          outputs: [{ productId: 'a', uom: 'each', quantity: 4, costRatio: 1 }],
        },
      ],
    },
    { 'raw-product': { unitCost: 6 } },
    journals,
  );
  expect(docs[0].details[0]).toMatchObject({ count: 10, amount: 60 });
  expect(docs[1].details[0]).toMatchObject({ count: 4, amount: 100 });
});

test('updates keep matching transaction and product-detail ids while adding new cost accounts', () => {
  const previous = [
    {
      _id: 'out',
      date: new Date(),
      journal: 'invOut',
      side: 'ct',
      details: [
        {
          _id: 'raw-detail',
          accountId: 'raw',
          productId: 'raw-product',
          count: 2,
          amount: 12,
        },
      ],
    },
    {
      _id: 'income',
      date: new Date(),
      journal: 'invIncome',
      side: 'dt',
      details: [
        {
          _id: 'output-detail',
          accountId: 'finished',
          productId: 'a',
          count: 1,
          amount: 20,
        },
      ],
    },
  ];
  const docs = buildTransactions(
    {
      ...execution,
      jobs: [
        {
          ...execution,
          inputs: [{ productId: 'raw-product', quantity: 10 }],
          outputs: [{ productId: 'a', quantity: 4, costRatio: 1 }],
        },
      ],
    },
    { 'raw-product': { unitCost: 6 } },
    journals,
  );
  const matched = matchExecutionTransactionIds(docs, previous);
  expect(matched[0]).toMatchObject({
    _id: 'out',
    details: [{ _id: 'raw-detail', count: 10 }],
  });
  expect(matched[1]).toMatchObject({
    _id: 'income',
    details: [{ _id: 'output-detail', count: 4 }],
  });
  expect(matched[2]._id).toBeUndefined();
});
