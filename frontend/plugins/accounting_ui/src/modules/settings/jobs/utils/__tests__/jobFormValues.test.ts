import { IJob } from '@/settings/jobs/types/Job';
import {
  jobFormValues,
  scaleJobFormValues,
} from '@/settings/jobs/utils/jobFormValues';

const job: IJob = {
  _id: 'job',
  name: 'Assembly',
  durationType: 'real',
  duration: 30,
  inputs: [{ productId: 'material', uom: 'pack', quantity: 2 }],
  outputs: [{ productId: 'output', quantity: 3, costRatio: 2 }],
  laborCosts: [{ name: 'Labor', accountId: 'labor', amount: 10 }],
  overheadCosts: [],
};

test('edit values normalize optional fields and clear real-time duration', () => {
  expect(jobFormValues(job)).toEqual({
    code: '',
    name: 'Assembly',
    description: '',
    duration: undefined,
    durationType: 'real',
    status: 'active',
    inputs: job.inputs,
    outputs: job.outputs,
    laborCosts: job.laborCosts,
    overheadCosts: [],
  });
});

test('nullable response fields are normalized only at the form boundary', () => {
  const response: IJob = {
    ...job,
    name: null,
    code: null,
    description: null,
    duration: null,
    durationType: null,
    status: null,
    inputs: [
      null,
      { productId: null, uom: null, quantity: null, costRatio: null },
    ],
    outputs: null,
  };
  expect(jobFormValues(response)).toMatchObject({
    name: '',
    code: '',
    description: '',
    duration: undefined,
    durationType: 'minut',
    status: 'active',
    inputs: [
      { productId: '', uom: undefined, quantity: 0, costRatio: undefined },
    ],
    outputs: [],
  });
  expect(response.inputs?.[1]?.quantity).toBeNull();
  expect(response.name).toBeNull();
});

test('fixed duration and explicit fields are retained and unknown units use the existing default', () => {
  expect(
    jobFormValues({
      ...job,
      code: '001',
      description: 'Description',
      durationType: 'hour',
      duration: 0,
      status: 'inactive',
    }),
  ).toMatchObject({
    code: '001',
    description: 'Description',
    duration: 0,
    durationType: 'hour',
    status: 'inactive',
  });
  expect(jobFormValues({ ...job, durationType: 'unknown' }).durationType).toBe(
    'minut',
  );
});

test('quantity changes scale actual materials and costs without changing ratios or form metadata', () => {
  const original = jobFormValues(job);
  const scaled = scaleJobFormValues(original, 2.5);
  expect(scaled.inputs[0]).toMatchObject({ quantity: 5, uom: 'pack' });
  expect(scaled.outputs[0]).toMatchObject({ quantity: 7.5, costRatio: 2 });
  expect(scaled.laborCosts[0].amount).toBe(25);
  expect(scaled.name).toBe(original.name);
  scaled.inputs[0].quantity = 99;
  scaled.laborCosts[0].amount = 99;
  expect(original.inputs[0].quantity).toBe(2);
  expect(original.laborCosts[0].amount).toBe(10);
  expect(scaleJobFormValues(scaleJobFormValues(original, 5), 0.2)).toEqual(
    original,
  );
});
