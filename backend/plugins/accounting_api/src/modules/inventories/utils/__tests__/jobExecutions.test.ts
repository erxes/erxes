import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { activeCost } from '../../../accounting/utils/inventories';
import { IJobExecution } from '../../@types/jobExecutions';
import {
  postJobExecution,
  saveJobExecution,
  undoJobExecution,
} from '../jobExecutions';
import { assertCanWriteTransactionAccounts } from '../../../accounting/utils/trPermissions';
import { jobExecutionMutations } from '../../graphql/resolvers/mutations/jobExecutions';
import { jobExecutionQueries } from '../../graphql/resolvers/queries/jobExecutions';
import { IContext } from '~/connectionResolvers';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number, precision = 4) => Number(value.toFixed(precision)),
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));
jest.mock('~/init-trpc', () => ({
  getCoreConfig: jest.fn().mockResolvedValue('MNT'),
}));
jest.mock('../../../accounting/utils/inventories', () => ({
  activeCost: jest.fn(),
}));
jest.mock('../../../accounting/utils/trPermissions', () => ({
  assertCanWriteTransactionAccounts: jest.fn().mockResolvedValue(undefined),
}));

const input: IJobExecution = {
  date: new Date('2026-10-19T00:00:00Z'),
  inputAccountId: 'raw',
  outputAccountId: 'finished',
  jobs: [
    {
      _id: 'row',
      jobId: 'card',
      quantity: 2,
      inputs: [{ productId: 'input', uom: '', quantity: 3 }],
      outputs: [{ productId: 'output', uom: '', quantity: 5, costRatio: 1 }],
      laborCosts: [{ name: 'Work', amount: 20, accountId: 'labor' }],
      overheadCosts: [],
    },
  ],
};
const setup = () => {
  const execution = {
    ...input,
    _id: 'execution',
    jobs: input.jobs.map((row) => ({ ...row, jobName: 'Original' })),
    status: 'draft',
  };
  const updateOne = jest.fn().mockResolvedValue({ modifiedCount: 1 });
  const create = jest.fn().mockResolvedValue(execution);
  const findOneAndUpdate = jest
    .fn()
    .mockReturnValue({ lean: jest.fn().mockResolvedValue(execution) });
  const jobExecutions = {
    findOneAndUpdate,
    create,
    updateOne,
    findOne: jest
      .fn()
      .mockReturnValue({ lean: jest.fn().mockResolvedValue(execution) }),
  };
  const transactions = {
    exists: jest.fn().mockResolvedValue(null),
    createPTransaction: jest
      .fn()
      .mockResolvedValue([{ parentId: 'parent', ptrId: 'ptr' }]),
    updatePTransaction: jest
      .fn()
      .mockResolvedValue([{ parentId: 'parent', ptrId: 'ptr' }]),
    findOne: jest.fn().mockReturnValue({
      lean: jest.fn().mockResolvedValue({ parentId: 'parent' }),
    }),
    find: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }),
    removePTransaction: jest.fn().mockResolvedValue({ n: 1, ok: 1 }),
  };
  const models = {
    JobExecutions: jobExecutions,
    Transactions: transactions,
    Jobs: {
      getJob: jest.fn().mockResolvedValue({
        ...input,
        _id: 'card',
        name: 'Changed template',
        status: 'active',
        inputs: [{ productId: 'input', quantity: 10 }],
        outputs: [{ productId: 'output', quantity: 20, costRatio: 1 }],
      }),
    },
    Accounts: {
      getAccount: jest.fn().mockImplementation(({ _id }: { _id: string }) =>
        Promise.resolve({
          _id,
          journal: _id === 'labor' ? 'main' : 'inventory',
          currency: 'MNT',
          kind: 'active',
        }),
      ),
    },
  } as unknown as IModels;
  jest.mocked(activeCost).mockResolvedValue({
    input: { unitCost: 10, totalCost: 100, remainder: 10 },
  });
  jest
    .mocked(sendTRPCMessage)
    .mockResolvedValue([{ _id: 'input' }, { _id: 'output' }]);
  return { models, jobExecutions, transactions, execution };
};

test('creates a draft with independent actual job rows and no planned duplicate arrays', async () => {
  const { models, jobExecutions } = setup();
  await saveJobExecution(models, 'tenant', input, 'user');
  expect(jobExecutions.create).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'draft',
      jobs: [
        expect.objectContaining({
          ...input.jobs[0],
          jobName: 'Changed template',
        }),
      ],
    }),
  );
});

test('editing preserves copied actuals and source name without rereading a changed template', async () => {
  const { models, jobExecutions, execution } = setup();
  jobExecutions.findOneAndUpdate.mockResolvedValue(execution);
  await saveJobExecution(models, 'tenant', input, 'user', 'execution');
  expect(jobExecutions.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: 'execution', status: 'draft' },
    expect.objectContaining({
      $set: expect.objectContaining({
        jobs: execution.jobs,
      }),
    }),
    { new: true },
  );
});

test('concurrent or repeated posting cannot create another transaction group', async () => {
  const { models, jobExecutions, transactions } = setup();
  jobExecutions.findOneAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue(null),
  });
  await expect(
    postJobExecution(models, 'tenant', 'execution', 'user'),
  ).rejects.toThrow('busy or cannot be posted');
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
});

test('posting uses one grouped transaction call and persists its shared pointer', async () => {
  const { models, transactions, jobExecutions } = setup();
  jest.mocked(sendTRPCMessage).mockClear();
  await postJobExecution(models, 'tenant', 'execution', 'user');
  expect(sendTRPCMessage).not.toHaveBeenCalled();
  expect(models.Jobs.getJob).not.toHaveBeenCalled();
  expect(transactions.createPTransaction).toHaveBeenCalledTimes(1);
  expect(
    transactions.createPTransaction.mock.calls[0][0].map(
      (doc: { journal: string }) => doc.journal,
    ),
  ).toEqual(['invOut', 'invIncome', 'main']);
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    expect.objectContaining({
      $set: expect.objectContaining({
        status: 'posted',
        parentId: 'parent',
        ptrId: 'ptr',
      }),
    }),
  );
});

test('job execution transaction links prevent duplicate execution posting', async () => {
  const { models, transactions } = setup();
  transactions.exists.mockResolvedValue({ _id: 'linked' });
  await expect(
    postJobExecution(models, 'tenant', 'execution', 'user'),
  ).rejects.toThrow('Linked transactions already exist');
  expect(transactions.exists).toHaveBeenCalledWith({
    contentType: 'jobExecution',
    contentId: 'execution',
  });
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
});

test('failed posting with partial transactions requires undo before retry', async () => {
  const { models, transactions, jobExecutions } = setup();
  transactions.exists
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce({ _id: 'partial' });
  transactions.createPTransaction.mockRejectedValue(new Error('Write failed'));
  await expect(
    postJobExecution(models, 'tenant', 'execution', 'user'),
  ).rejects.toThrow('Write failed');
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    { $set: { status: 'error', error: 'Write failed' } },
  );
});

test('undo checks account write permissions and removes the linked group', async () => {
  const { models, transactions, jobExecutions } = setup();
  await undoJobExecution(models, 'execution', 'user');
  expect(transactions.findOne).toHaveBeenCalledWith({
    $or: [
      {
        contentType: 'jobExecution',
        contentId: 'execution',
      },
    ],
  });
  expect(assertCanWriteTransactionAccounts).toHaveBeenCalled();
  expect(transactions.removePTransaction).toHaveBeenCalledWith({
    parentId: 'parent',
  });
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    expect.objectContaining({
      $set: expect.objectContaining({ status: 'draft' }),
      $unset: { parentId: 1, ptrId: 1 },
    }),
  );
});

test('denied reads and writes never touch tenant models', async () => {
  const checkPermission = jest.fn().mockRejectedValue(new Error('Denied'));
  const context = { checkPermission } as unknown as IContext;
  await expect(
    jobExecutionQueries.jobExecutions(undefined, {}, context),
  ).rejects.toThrow('Denied');
  await expect(
    jobExecutionMutations.jobExecutionSave(undefined, { input }, context),
  ).rejects.toThrow('Denied');
  await expect(
    jobExecutionMutations.jobExecutionPost(
      undefined,
      { _id: 'execution' },
      context,
    ),
  ).rejects.toThrow('Denied');
});

test('saves multiple jobs with edited actuals only and deduplicates account validation', async () => {
  const { models, jobExecutions } = setup();
  const jobs = [
    input.jobs[0],
    {
      ...input.jobs[0],
      _id: 'second',
      jobId: 'other',
      quantity: 10,
      inputs: [{ productId: 'input', uom: '', quantity: 17 }],
      outputs: [{ productId: 'output', uom: '', quantity: 9, costRatio: 2 }],
    },
  ];
  await saveJobExecution(models, 'tenant', { ...input, jobs }, 'user');
  const doc = jobExecutions.create.mock.calls[0][0];
  expect(doc.jobs).toEqual(
    jobs.map((row) => ({ ...row, jobName: 'Changed template' })),
  );
  expect(doc).not.toHaveProperty('plannedInputs');
  expect(doc).not.toHaveProperty('plannedOutputs');
  expect(doc).not.toHaveProperty('inputs');
  expect(models.Accounts.getAccount).toHaveBeenCalledTimes(3);
});

test.each(['empty', 'duplicate', 'invalid-ratio'] as const)(
  'rejects %s execution jobs before writes',
  async (kind) => {
    const { models, jobExecutions } = setup();
    let jobs = input.jobs;
    if (kind === 'empty') jobs = [];
    if (kind === 'duplicate') jobs = [input.jobs[0], input.jobs[0]];
    if (kind === 'invalid-ratio')
      jobs = [
        {
          ...input.jobs[0],
          outputs: [{ productId: 'output', quantity: 1, costRatio: 0 }],
        },
      ];
    await expect(
      saveJobExecution(models, 'tenant', { ...input, jobs }, 'user'),
    ).rejects.toThrow();
    expect(jobExecutions.create).not.toHaveBeenCalled();
  },
);

test('save converts job subunits into base units and posting does not convert them again', async () => {
  const { models, jobExecutions, transactions, execution } = setup();
  jest.mocked(sendTRPCMessage).mockImplementation(async ({ module }) =>
    module === 'productUoms'
      ? []
      : [
          { _id: 'input', uom: 'ea', subUoms: [{ uom: 'box', ratio: 5 }] },
          { _id: 'output', uom: 'ea', subUoms: [{ uom: 'pack', ratio: 2 }] },
        ],
  );
  const jobs = [
    {
      ...input.jobs[0],
      inputs: [{ productId: 'input', uom: 'box', quantity: 3 }],
      outputs: [
        { productId: 'output', uom: 'pack', quantity: 5, costRatio: 1 },
      ],
    },
  ];
  await saveJobExecution(models, 'tenant', { ...input, jobs }, 'user');
  const savedJobs = jobExecutions.create.mock.calls[0][0].jobs;
  expect(savedJobs[0]).toMatchObject({
    inputs: [{ productId: 'input', uom: 'ea', quantity: 15 }],
    outputs: [{ productId: 'output', uom: 'ea', quantity: 10, costRatio: 1 }],
  });
  jobExecutions.findOneAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue({ ...execution, jobs: savedJobs }),
  });
  await postJobExecution(models, 'tenant', 'execution', 'user');
  const docs = transactions.createPTransaction.mock.calls[0][0];
  expect(docs[0].details[0]).toMatchObject({
    productId: 'input',
    count: 15,
    amount: 150,
  });
  expect(docs[1].details[0]).toMatchObject({
    productId: 'output',
    count: 10,
    amount: 170,
  });
});

test('missing unit ratios reject execution saves before persisting anything', async () => {
  const { models, jobExecutions } = setup();
  jest.mocked(sendTRPCMessage).mockResolvedValue([
    { _id: 'input', uom: 'ea', subUoms: [{ uom: 'box' }] },
    { _id: 'output', uom: 'ea' },
  ]);
  const jobs = [
    {
      ...input.jobs[0],
      inputs: [{ productId: 'input', uom: 'box', quantity: 3 }],
    },
  ];
  await expect(
    saveJobExecution(models, 'tenant', { ...input, jobs }, 'user'),
  ).rejects.toThrow('Invalid product unit');
  expect(jobExecutions.create).not.toHaveBeenCalled();
});

const postedSetup = () => {
  const state = setup();
  const posted = {
    ...state.execution,
    status: 'posted',
    parentId: 'parent',
    ptrId: 'ptr',
  };
  state.jobExecutions.findOne.mockReturnValue({
    lean: jest.fn().mockResolvedValue(posted),
  });
  state.jobExecutions.findOneAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue(posted),
  });
  const previous = [
    {
      _id: 'old-out',
      parentId: 'parent',
      ptrId: 'ptr',
      date: input.date,
      journal: 'invOut',
      side: 'ct',
      contentType: 'jobExecution',
      contentId: 'execution',
      details: [
        {
          _id: 'old-input',
          accountId: 'raw',
          productId: 'input',
          count: 3,
          amount: 30,
        },
      ],
    },
    {
      _id: 'old-income',
      parentId: 'parent',
      ptrId: 'ptr',
      date: input.date,
      journal: 'invIncome',
      side: 'dt',
      contentType: 'jobExecution',
      contentId: 'execution',
      details: [
        {
          _id: 'old-output',
          accountId: 'finished',
          productId: 'output',
          count: 5,
          amount: 50,
        },
      ],
    },
    {
      _id: 'old-labor',
      parentId: 'parent',
      ptrId: 'ptr',
      date: input.date,
      journal: 'main',
      side: 'ct',
      contentType: 'jobExecution',
      contentId: 'execution',
      details: [{ _id: 'old-labor-detail', accountId: 'labor', amount: 20 }],
    },
  ];
  state.transactions.find.mockReturnValue({
    lean: jest.fn().mockResolvedValue(previous),
  });
  return { ...state, posted, previous };
};

test('posting a posted execution updates its existing group without unit conversion or duplicate transactions', async () => {
  const { models, transactions, previous, posted, jobExecutions } =
    postedSetup();
  jest.mocked(sendTRPCMessage).mockClear();
  await postJobExecution(models, 'tenant', 'execution', 'user');
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
  expect(transactions.updatePTransaction).toHaveBeenCalledTimes(1);
  const [parentId, docs, userId] =
    transactions.updatePTransaction.mock.calls[0];
  expect(parentId).toBe(posted.parentId);
  expect(userId).toBe('user');
  expect(docs.map((doc: { _id: string }) => doc._id)).toEqual(
    previous.map((doc) => doc._id),
  );
  expect(activeCost).toHaveBeenCalledWith(
    models,
    input.inputAccountId,
    input.inputBranchId,
    input.inputDepartmentId,
    ['input'],
    previous.map((row) => row._id),
  );
  expect(sendTRPCMessage).not.toHaveBeenCalled();
  expect(models.Jobs.getJob).not.toHaveBeenCalled();
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    expect.objectContaining({
      $set: expect.objectContaining({
        status: 'posted',
        parentId: posted.parentId,
        ptrId: posted.ptrId,
      }),
    }),
  );
});

test('concurrent re-post cannot bypass the posted execution update lock', async () => {
  const { models, transactions, jobExecutions } = postedSetup();
  jobExecutions.findOneAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue(null),
  });
  await expect(
    postJobExecution(models, 'tenant', 'execution', 'user'),
  ).rejects.toThrow('already being changed');
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
  expect(transactions.updatePTransaction).not.toHaveBeenCalled();
});

test('editing posted actuals updates the existing transaction group and excludes its old inventory effects', async () => {
  const { models, transactions, jobExecutions, previous } = postedSetup();
  const jobs = [
    {
      ...input.jobs[0],
      inputs: [{ productId: 'input', uom: '', quantity: 7 }],
      outputs: [{ productId: 'output', uom: '', quantity: 9, costRatio: 1 }],
      laborCosts: [{ name: 'Updated work', accountId: 'labor', amount: 30 }],
    },
  ];
  await saveJobExecution(
    models,
    'tenant',
    { ...input, jobs },
    'user',
    'execution',
  );
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
  expect(transactions.updatePTransaction).toHaveBeenCalledTimes(1);
  const [parentId, docs, userId] =
    transactions.updatePTransaction.mock.calls[0];
  expect(parentId).toBe('parent');
  expect(userId).toBe('user');
  expect(docs[0]).toMatchObject({
    _id: 'old-out',
    details: [{ _id: 'old-input', count: 7, amount: 70 }],
  });
  expect(docs[1]).toMatchObject({
    _id: 'old-income',
    details: [{ _id: 'old-output', count: 9, amount: 100 }],
  });
  expect(docs[2]).toMatchObject({
    _id: 'old-labor',
    details: [{ _id: 'old-labor-detail', amount: 30 }],
  });
  expect(activeCost).toHaveBeenLastCalledWith(
    models,
    'raw',
    undefined,
    undefined,
    ['input'],
    previous.map((row) => row._id),
  );
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    expect.objectContaining({
      $set: expect.objectContaining({
        status: 'posted',
        jobs: expect.any(Array),
        parentId: 'parent',
        ptrId: 'ptr',
      }),
    }),
  );
});

test('posted edits propagate changed inventory accounts and locations and remove obsolete cost rows', async () => {
  const { models, transactions } = postedSetup();
  await saveJobExecution(
    models,
    'tenant',
    {
      ...input,
      inputAccountId: 'new-raw',
      inputBranchId: 'source',
      outputDepartmentId: 'target',
      jobs: [{ ...input.jobs[0], laborCosts: [] }],
    },
    'user',
    'execution',
  );
  const docs = transactions.updatePTransaction.mock.calls[0][1];
  expect(docs).toHaveLength(2);
  expect(docs[0]).toMatchObject({
    _id: 'old-out',
    branchId: 'source',
    details: [{ accountId: 'new-raw', count: 3 }],
  });
  expect(docs[1]).toMatchObject({
    _id: 'old-income',
    departmentId: 'target',
    details: [{ amount: 30 }],
  });
});

test('failed transaction updates enter error state and cannot silently retry or create another group', async () => {
  const { models, transactions, jobExecutions } = postedSetup();
  transactions.updatePTransaction.mockRejectedValue(
    new Error('Partial update failed'),
  );
  await expect(
    saveJobExecution(models, 'tenant', input, 'user', 'execution'),
  ).rejects.toThrow('Partial update failed');
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    { $set: { status: 'error', error: 'Partial update failed' } },
  );
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
});

test('account denial before transaction updates leaves the posted snapshot unchanged', async () => {
  const { models, transactions, jobExecutions } = postedSetup();
  jest
    .mocked(assertCanWriteTransactionAccounts)
    .mockRejectedValueOnce(new Error('Denied'));
  await expect(
    saveJobExecution(models, 'tenant', input, 'user', 'execution'),
  ).rejects.toThrow('Denied');
  expect(transactions.updatePTransaction).not.toHaveBeenCalled();
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    { $set: { status: 'posted', error: 'Denied' } },
  );
});

test('concurrent posted edits cannot update the same transaction group twice', async () => {
  const { models, transactions, jobExecutions } = postedSetup();
  jobExecutions.findOneAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue(null),
  });
  await expect(
    saveJobExecution(models, 'tenant', input, 'user', 'execution'),
  ).rejects.toThrow('already being changed');
  expect(transactions.updatePTransaction).not.toHaveBeenCalled();
});

test('does not overwrite unrelated source rows added to the linked transaction group', async () => {
  const { models, transactions, previous } = postedSetup();
  transactions.find.mockReturnValue({
    lean: jest
      .fn()
      .mockResolvedValue([
        ...previous,
        { ...previous[2], _id: 'manual', contentId: '', contentType: '' },
      ]),
  });
  await expect(
    saveJobExecution(models, 'tenant', input, 'user', 'execution'),
  ).rejects.toThrow('changed outside this execution');
  expect(transactions.updatePTransaction).not.toHaveBeenCalled();
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
});
