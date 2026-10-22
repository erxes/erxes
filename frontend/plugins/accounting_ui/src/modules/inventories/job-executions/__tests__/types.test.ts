import { jobValues } from '@/inventories/job-executions/jobValues';
import { IJob } from '@/settings/jobs/types/Job';

test('copies and scales planned quantities and costs without mutating the technology card', () => {
  const card: IJob = {
    _id: 'card',
    name: 'Assembly',
    inputs: [{ productId: 'raw', uom: 'box', quantity: 2 }],
    outputs: [
      { productId: 'a', quantity: 1, costRatio: 1 },
      { productId: 'b', quantity: 3, costRatio: 2 },
    ],
    laborCosts: [{ name: 'Work', accountId: 'labor', amount: 10 }],
    overheadCosts: [{ name: 'Power', accountId: 'power', amount: 5 }],
  };
  const values = jobValues(card, 4);
  expect(values.inputs[0]).toMatchObject({ quantity: 8, uom: 'box' });
  expect(values.outputs.map((row) => [row.quantity, row.costRatio])).toEqual([
    [4, 1],
    [12, 2],
  ]);
  expect(values.laborCosts[0].amount).toBe(40);
  expect(values.overheadCosts[0].amount).toBe(20);
  values.inputs[0].quantity = 7;
  values.laborCosts[0].amount = 39;
  expect(card.inputs?.[0]?.quantity).toBe(2);
  expect(card.laborCosts?.[0].amount).toBe(10);
});
