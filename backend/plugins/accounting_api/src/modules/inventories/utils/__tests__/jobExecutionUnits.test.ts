import { IJobExecutionItem } from '../../@types/jobExecutions';
import { executionJobsInBaseUnits } from '../jobExecutionUnits';
import { buildJobExecutionTransactions } from '../jobExecutionTransactions';

const job: IJobExecutionItem = {
  _id: 'row',
  jobId: 'job',
  quantity: 3,
  inputs: [{ productId: 'raw', uom: 'box', quantity: 6 }],
  outputs: [{ productId: 'finished', uom: 'pack', quantity: 3, costRatio: 2 }],
  laborCosts: [],
  overheadCosts: [],
};
const products = [
  { _id: 'raw', uom: 'ea', subUoms: [{ uom: 'box', ratio: 5 }] },
  { _id: 'finished', uom: 'ea', subUoms: [{ uom: 'pack', ratio: 2 }] },
];

test('normalizes both sides without changing cost ratios, costs or source job values', () => {
  const [converted] = executionJobsInBaseUnits([job], products, []);
  expect(converted.inputs[0]).toEqual({
    productId: 'raw',
    uom: 'ea',
    quantity: 30,
  });
  expect(converted.outputs[0]).toEqual({
    productId: 'finished',
    uom: 'ea',
    quantity: 6,
    costRatio: 2,
  });
  expect(converted.quantity).toBe(3);
  expect(job.inputs[0]).toMatchObject({ uom: 'box', quantity: 6 });
  expect(executionJobsInBaseUnits([converted], products, [])).toEqual([
    converted,
  ]);
});

test('merges different job units into one base-unit transaction detail per product and side', () => {
  const other = {
    ...job,
    _id: 'other',
    inputs: [{ productId: 'raw', uom: 'ea', quantity: 10 }],
    outputs: [{ productId: 'finished', uom: 'ea', quantity: 4, costRatio: 1 }],
  };
  const jobs = executionJobsInBaseUnits([job, other], products, []);
  const docs = buildJobExecutionTransactions(
    {
      _id: 'execution',
      date: new Date(),
      inputAccountId: 'raw-account',
      outputAccountId: 'finished-account',
      jobs,
    },
    { raw: { unitCost: 2 } },
    new Map(),
  );
  expect(docs[0].details).toHaveLength(1);
  expect(docs[0].details[0]).toMatchObject({
    productId: 'raw',
    count: 40,
    amount: 80,
  });
  expect(docs[1].details).toHaveLength(1);
  expect(docs[1].details[0]).toMatchObject({
    productId: 'finished',
    count: 10,
    amount: 80,
    unitPrice: 8,
  });
});

test('resolves platform unit ids and labels to base unit codes', () => {
  const units = [
    { _id: 'base-id', code: 'ea', name: 'Each' },
    { _id: 'box-id', code: 'box', name: 'Box' },
  ];
  const [converted] = executionJobsInBaseUnits(
    [{ ...job, inputs: [{ productId: 'raw', uom: 'Box', quantity: 2 }] }],
    [
      {
        ...products[0],
        uom: 'base-id',
        subUoms: [{ uom: 'box-id', ratio: 5 }],
      },
      products[1],
    ],
    units,
  );
  expect(converted.inputs[0]).toEqual({
    productId: 'raw',
    uom: 'ea',
    quantity: 10,
  });
});
