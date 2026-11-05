import type { IModels } from '~/connectionResolvers';
import type { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import type { IJob } from '../../../@types/jobs';
import { IJobModel, loadJobClass } from '../Jobs';

const baseCard: IJob = {
  name: 'Production step',
  durationType: 'real',
  inputs: [{ productId: 'input', quantity: 1 }],
  outputs: [{ productId: 'output', quantity: 1, costRatio: 1 }],
};

const setup = () => {
  const create = jest.fn().mockResolvedValue({ _id: 'card' });
  const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  const getJob = jest.fn().mockResolvedValue({ _id: 'card' });
  const getAccount = jest.fn().mockResolvedValue({ status: 'active' });
  const findOneAndDelete = jest.fn().mockResolvedValue({ _id: 'card' });
  const sendDbEventLog = jest.fn();
  const models = {
    Jobs: { create, updateOne, getJob, findOneAndDelete },
    Accounts: { getAccount },
  } as unknown as IModels;
  const statics = loadJobClass(models, {
    sendDbEventLog,
  } as unknown as EventDispatcherReturn).statics as Pick<
    IJobModel,
    'createJob' | 'updateJob' | 'removeJob'
  >;
  return {
    statics,
    create,
    updateOne,
    getAccount,
    getJob,
    findOneAndDelete,
    sendDbEventLog,
  };
};

test('job creation logs the saved document once', async () => {
  const { statics, create, sendDbEventLog } = setup();
  const saved = { ...baseCard, _id: 'card' };
  create.mockResolvedValueOnce(saved);
  await statics.createJob(baseCard, 'user');
  expect(sendDbEventLog).toHaveBeenCalledTimes(1);
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'create',
    docId: 'card',
    currentDocument: saved,
  });
});

test('job edits log the actual previous and saved snapshots', async () => {
  const { statics, getJob, sendDbEventLog } = setup();
  const previous = {
    ...baseCard,
    _id: 'card',
    duration: 5,
    durationType: 'hour',
  };
  const saved = { ...baseCard, _id: 'card' };
  getJob.mockResolvedValueOnce(previous).mockResolvedValueOnce(saved);
  await statics.updateJob({ ...baseCard, _id: 'card' }, 'user');
  expect(sendDbEventLog).toHaveBeenCalledTimes(1);
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'update',
    docId: 'card',
    prevDocument: previous,
    currentDocument: saved,
  });
});

test('job deletion atomically obtains and logs the removed snapshot', async () => {
  const { statics, findOneAndDelete, sendDbEventLog } = setup();
  const previous = { ...baseCard, _id: 'card' };
  findOneAndDelete.mockResolvedValueOnce(previous);
  await expect(statics.removeJob('card')).resolves.toEqual({ deletedCount: 1 });
  expect(findOneAndDelete).toHaveBeenCalledWith({ _id: 'card' });
  expect(sendDbEventLog).toHaveBeenCalledTimes(1);
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'delete',
    docId: 'card',
    prevDocument: previous,
  });
});

test('missing jobs do not emit deletion logs', async () => {
  const { statics, findOneAndDelete, sendDbEventLog } = setup();
  findOneAndDelete.mockResolvedValueOnce(null);
  await expect(statics.removeJob('missing')).rejects.toThrow('Job not found');
  expect(sendDbEventLog).not.toHaveBeenCalled();
});

test('failed job persistence does not emit a create log', async () => {
  const { statics, create, sendDbEventLog } = setup();
  create.mockRejectedValueOnce(new Error('Write failed'));
  await expect(statics.createJob(baseCard, 'user')).rejects.toThrow(
    'Write failed',
  );
  expect(sendDbEventLog).not.toHaveBeenCalled();
});

test('failed job edits do not emit an update log', async () => {
  const { statics, updateOne, sendDbEventLog } = setup();
  updateOne.mockRejectedValueOnce(new Error('Write failed'));
  await expect(
    statics.updateJob({ ...baseCard, _id: 'card' }, 'user'),
  ).rejects.toThrow('Write failed');
  expect(sendDbEventLog).not.toHaveBeenCalled();
});

test('omitted cost groups default to empty arrays without account lookups', async () => {
  const { statics, create, getAccount } = setup();
  await statics.createJob(baseCard, 'user');
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({
      laborCosts: [],
      overheadCosts: [],
    }),
  );
  expect(getAccount).not.toHaveBeenCalled();
});

test.each(['overheadCosts', 'laborCosts'] as const)(
  '%s requires an account for every row',
  async (field) => {
    const { statics, create } = setup();
    await expect(
      statics.createJob(
        {
          ...baseCard,
          [field]: [{ name: 'Cost', amount: 100, accountId: '' }],
        },
        'user',
      ),
    ).rejects.toThrow('posting account is required');
    expect(create).not.toHaveBeenCalled();
  },
);

test.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
  'rejects invalid cost %p before writing',
  async (amount) => {
    const { statics, create } = setup();
    await expect(
      statics.createJob(
        {
          ...baseCard,
          overheadCosts: [{ name: 'Cost', amount, accountId: 'overhead' }],
        },
        'user',
      ),
    ).rejects.toThrow('finite non-negative amount');
    expect(create).not.toHaveBeenCalled();
  },
);

test('persists both estimates and checks tenant-scoped active posting accounts on edit', async () => {
  const { statics, updateOne, getAccount } = setup();
  const costs = {
    overheadCosts: [
      { name: 'Electricity', amount: 1500, accountId: 'overhead' },
    ],
    laborCosts: [
      { name: 'Assembly', amount: 2500, accountId: 'labor' },
      { name: 'Packing', amount: 500, accountId: 'labor' },
    ],
  };
  await statics.updateJob({ ...baseCard, _id: 'card', ...costs }, 'user');
  expect(getAccount).toHaveBeenCalledWith({
    _id: 'overhead',
    status: 'active',
  });
  expect(getAccount).toHaveBeenCalledWith({ _id: 'labor', status: 'active' });
  expect(getAccount).toHaveBeenCalledTimes(2);
  expect(updateOne).toHaveBeenCalledWith(
    { _id: 'card' },
    expect.objectContaining({ $set: expect.objectContaining(costs) }),
  );
});

test('a missing or inactive account prevents persistence', async () => {
  const { statics, create, getAccount } = setup();
  getAccount.mockRejectedValue(new Error('Account not found'));
  await expect(
    statics.createJob(
      {
        ...baseCard,
        laborCosts: [{ name: 'Labor', amount: 500, accountId: 'missing' }],
      },
      'user',
    ),
  ).rejects.toThrow('Account not found');
  expect(create).not.toHaveBeenCalled();
});

test('independent account reads start together and all finish before persistence', async () => {
  const { statics, create, getAccount } = setup();
  const complete: (() => void)[] = [];
  getAccount.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        complete.push(resolve);
      }),
  );
  const saving = statics.createJob(
    {
      ...baseCard,
      laborCosts: [{ name: 'Assembly', amount: 100, accountId: 'labor' }],
      overheadCosts: [
        { name: 'Electricity', amount: 200, accountId: 'overhead' },
      ],
    },
    'user',
  );
  expect(getAccount).toHaveBeenCalledTimes(2);
  expect(create).not.toHaveBeenCalled();
  complete[0]();
  await Promise.resolve();
  expect(create).not.toHaveBeenCalled();
  complete[1]();
  await saving;
  expect(create).toHaveBeenCalledTimes(1);
});

test('cost rows require a name', async () => {
  const { statics, create } = setup();
  await expect(
    statics.createJob(
      {
        ...baseCard,
        laborCosts: [{ name: ' ', amount: 100, accountId: 'labor' }],
      },
      'user',
    ),
  ).rejects.toThrow('name is required');
  expect(create).not.toHaveBeenCalled();
});

test('editing to empty arrays clears all cost rows', async () => {
  const { statics, getJob, updateOne, getAccount } = setup();
  getJob.mockResolvedValue({
    ...baseCard,
    _id: 'card',
    laborCosts: [{ name: 'Assembly', amount: 500, accountId: 'labor' }],
    overheadCosts: [
      { name: 'Electricity', amount: 300, accountId: 'overhead' },
    ],
  });
  await statics.updateJob(
    { ...baseCard, _id: 'card', laborCosts: [], overheadCosts: [] },
    'user',
  );
  expect(updateOne).toHaveBeenCalledWith(
    { _id: 'card' },
    expect.objectContaining({
      $set: expect.objectContaining({ laborCosts: [], overheadCosts: [] }),
    }),
  );
  expect(getAccount).not.toHaveBeenCalled();
});

test('editing without cost groups preserves existing array rows', async () => {
  const { statics, getJob, updateOne } = setup();
  getJob.mockResolvedValue({
    ...baseCard,
    _id: 'card',
    laborCosts: [{ name: 'Assembly', amount: 500, accountId: 'labor' }],
  });
  await statics.updateJob({ ...baseCard, _id: 'card' }, 'user');
  expect(updateOne).toHaveBeenCalledWith(
    { _id: 'card' },
    expect.objectContaining({
      $set: expect.objectContaining({
        laborCosts: [{ name: 'Assembly', amount: 500, accountId: 'labor' }],
      }),
    }),
  );
});
