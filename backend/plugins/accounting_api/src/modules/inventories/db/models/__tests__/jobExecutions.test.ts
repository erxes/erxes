import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { activeCost } from '@/accounting/utils/inventories';
import { IJobExecution } from '@/inventories/@types/jobExecutions';
import { loadJobExecutionClass } from '../JobExecutions';
import { EventDispatcherReturn } from 'erxes-api-shared/core-modules';
import { assertCanWriteTransactionAccounts } from '@/accounting/utils/trPermissions';
import { jobExecutionMutations } from '@/inventories/graphql/resolvers/mutations/jobExecutions';
import { jobExecutionQueries } from '@/inventories/graphql/resolvers/queries/jobExecutions';
import { IContext } from '~/connectionResolvers';

jest.mock('erxes-api-shared/utils', () => ({
  schemaWrapper: (schema: unknown) => schema,
  mongooseStringRandomId: { type: String },
  fixNum: (value: number, precision = 4) => Number(value.toFixed(precision)),
  escapeRegExp: (value: string) => value,
  sendTRPCMessage: jest.fn(),
}));
jest.mock('~/init-trpc', () => ({
  getCoreConfig: jest.fn().mockResolvedValue('MNT'),
}));
jest.mock('@/accounting/utils/inventories', () => ({
  activeCost: jest.fn(),
}));
jest.mock('@/accounting/utils/trPermissions', () => ({
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
    findOneAndDelete: jest.fn().mockResolvedValue(execution),
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
  const sendDbEventLog = jest.fn();
  const schema = loadJobExecutionClass(models, 'tenant', {
    sendDbEventLog,
  } as unknown as EventDispatcherReturn);
  Object.assign(models.JobExecutions, schema.statics);
  jest.mocked(activeCost).mockResolvedValue({
    input: { unitCost: 10, totalCost: 100, remainder: 10 },
  });
  jest
    .mocked(sendTRPCMessage)
    .mockResolvedValue([{ _id: 'input' }, { _id: 'output' }]);
  return { models, jobExecutions, transactions, execution, sendDbEventLog };
};

test('creates a draft with independent actual job rows and no planned duplicate arrays', async () => {
  const { models, jobExecutions } = setup();
  await models.JobExecutions.saveJobExecution(input, 'user');
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
  await models.JobExecutions.saveJobExecution(input, 'user', 'execution');
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
    models.JobExecutions.postJobExecution('execution', 'user'),
  ).rejects.toThrow('busy or cannot be posted');
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
});

test('posting uses one grouped transaction call and persists its shared pointer', async () => {
  const { models, transactions, jobExecutions } = setup();
  jest.mocked(sendTRPCMessage).mockClear();
  await models.JobExecutions.postJobExecution('execution', 'user');
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
    models.JobExecutions.postJobExecution('execution', 'user'),
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
    models.JobExecutions.postJobExecution('execution', 'user'),
  ).rejects.toThrow('Write failed');
  expect(jobExecutions.updateOne).toHaveBeenCalledWith(
    { _id: 'execution' },
    { $set: { status: 'error', error: 'Write failed' } },
  );
});

test('undo checks account write permissions and removes the linked group', async () => {
  const { models, transactions, jobExecutions } = setup();
  await models.JobExecutions.undoJobExecution('execution', 'user');
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

test('creating a draft emits one scoped database create log', async () => {
  const { models, execution, sendDbEventLog } = setup();
  await models.JobExecutions.saveJobExecution(input, 'user');
  expect(sendDbEventLog).toHaveBeenCalledTimes(1);
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'create',
    docId: 'execution',
    currentDocument: execution,
  });
});

test('editing a draft logs the previous and saved documents', async () => {
  const { models, execution, jobExecutions, sendDbEventLog } = setup();
  const saved = { ...execution, description: 'Changed' };
  jobExecutions.findOneAndUpdate.mockResolvedValueOnce(saved);
  await models.JobExecutions.saveJobExecution(
    { ...input, description: 'Changed' },
    'user',
    'execution',
  );
  expect(sendDbEventLog).toHaveBeenCalledTimes(1);
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'update',
    docId: 'execution',
    prevDocument: execution,
    currentDocument: saved,
  });
});

test('posting logs the draft-to-posted transition after transactions are saved', async () => {
  const { models, execution, jobExecutions, sendDbEventLog } = setup();
  const saved = {
    ...execution,
    status: 'posted',
    parentId: 'parent',
    ptrId: 'ptr',
  };
  jobExecutions.findOne
    .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(execution) })
    .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(saved) });
  await models.JobExecutions.postJobExecution('execution', 'user');
  expect(sendDbEventLog).toHaveBeenCalledTimes(1);
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'update',
    docId: 'execution',
    prevDocument: execution,
    currentDocument: saved,
  });
});

test('undo logs the original posted document rather than its transient lock state', async () => {
  const { models, execution, jobExecutions, sendDbEventLog } = setup();
  const posted = {
    ...execution,
    status: 'posted',
    parentId: 'parent',
    ptrId: 'ptr',
  };
  jobExecutions.findOneAndUpdate.mockReturnValueOnce({
    lean: jest.fn().mockResolvedValue(posted),
  });
  await models.JobExecutions.undoJobExecution('execution', 'user');
  expect(jobExecutions.findOneAndUpdate).toHaveBeenCalledWith(
    { _id: 'execution', status: { $in: ['posted', 'error'] } },
    { $set: { status: 'undoing' } },
    { new: false },
  );
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'update',
    docId: 'execution',
    prevDocument: posted,
    currentDocument: execution,
  });
});

test('draft deletion is atomic and logs the deleted snapshot', async () => {
  const { models, execution, jobExecutions, sendDbEventLog } = setup();
  await expect(
    models.JobExecutions.removeJobExecution('execution'),
  ).resolves.toBe(true);
  expect(jobExecutions.findOneAndDelete).toHaveBeenCalledWith({
    _id: 'execution',
    status: 'draft',
  });
  expect(sendDbEventLog).toHaveBeenCalledWith({
    action: 'delete',
    docId: 'execution',
    prevDocument: execution,
  });
});

test('a rejected deletion does not emit a successful delete log', async () => {
  const { models, jobExecutions, sendDbEventLog } = setup();
  jobExecutions.findOneAndDelete.mockResolvedValueOnce(null);
  await expect(
    models.JobExecutions.removeJobExecution('execution'),
  ).rejects.toThrow('Only draft executions can be deleted');
  expect(sendDbEventLog).not.toHaveBeenCalled();
});

test('failed posting does not emit a successful lifecycle log', async () => {
  const { models, transactions, sendDbEventLog } = setup();
  transactions.createPTransaction.mockRejectedValueOnce(
    new Error('Write failed'),
  );
  await expect(
    models.JobExecutions.postJobExecution('execution', 'user'),
  ).rejects.toThrow('Write failed');
  expect(sendDbEventLog).not.toHaveBeenCalled();
});

test('execution mutations and detail query delegate to the tenant model', async () => {
  const { models, execution } = setup();
  const save = jest
    .spyOn(models.JobExecutions, 'saveJobExecution')
    .mockResolvedValue(execution as never);
  const post = jest
    .spyOn(models.JobExecutions, 'postJobExecution')
    .mockResolvedValue(execution as never);
  const undo = jest
    .spyOn(models.JobExecutions, 'undoJobExecution')
    .mockResolvedValue(execution as never);
  const remove = jest
    .spyOn(models.JobExecutions, 'removeJobExecution')
    .mockResolvedValue(true);
  const get = jest
    .spyOn(models.JobExecutions, 'getJobExecution')
    .mockResolvedValue(execution as never);
  const checkPermission = jest.fn().mockResolvedValue(undefined);
  const context = {
    models,
    user: { _id: 'user' },
    checkPermission,
  } as unknown as IContext;
  await jobExecutionMutations.jobExecutionSave(
    undefined,
    { _id: 'execution', input },
    context,
  );
  await jobExecutionMutations.jobExecutionPost(
    undefined,
    { _id: 'execution' },
    context,
  );
  await jobExecutionMutations.jobExecutionUndo(
    undefined,
    { _id: 'execution' },
    context,
  );
  await jobExecutionMutations.jobExecutionRemove(
    undefined,
    { _id: 'execution' },
    context,
  );
  await jobExecutionQueries.jobExecutionDetail(
    undefined,
    { _id: 'execution' },
    context,
  );
  expect(save).toHaveBeenCalledWith(input, 'user', 'execution');
  expect(post).toHaveBeenCalledWith('execution', 'user');
  expect(undo).toHaveBeenCalledWith('execution', 'user');
  expect(remove).toHaveBeenCalledWith('execution');
  expect(get).toHaveBeenCalledWith('execution');
  expect(checkPermission.mock.calls.map(([permission]) => permission)).toEqual([
    'manageJobExecutions',
    'manageJobExecutions',
    'manageJobExecutions',
    'removeJobExecutions',
    'readJobExecutions',
  ]);
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
  await models.JobExecutions.saveJobExecution({ ...input, jobs }, 'user');
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
      models.JobExecutions.saveJobExecution({ ...input, jobs }, 'user'),
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
  await models.JobExecutions.saveJobExecution({ ...input, jobs }, 'user');
  const savedJobs = jobExecutions.create.mock.calls[0][0].jobs;
  expect(savedJobs[0]).toMatchObject({
    inputs: [{ productId: 'input', uom: 'ea', quantity: 15 }],
    outputs: [{ productId: 'output', uom: 'ea', quantity: 10, costRatio: 1 }],
  });
  jobExecutions.findOneAndUpdate.mockReturnValue({
    lean: jest.fn().mockResolvedValue({ ...execution, jobs: savedJobs }),
  });
  await models.JobExecutions.postJobExecution('execution', 'user');
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
    models.JobExecutions.saveJobExecution({ ...input, jobs }, 'user'),
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

test.each(['save', 'post'] as const)(
  '%s of a posted execution logs one completed update without duplicate lifecycle events',
  async (action) => {
    const { models, posted, jobExecutions, sendDbEventLog } = postedSetup();
    const saved = { ...posted, description: 'Updated execution' };
    jobExecutions.findOne
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(posted) })
      .mockReturnValueOnce({ lean: jest.fn().mockResolvedValue(saved) });
    if (action === 'save') {
      await models.JobExecutions.saveJobExecution(input, 'user', 'execution');
    } else {
      await models.JobExecutions.postJobExecution('execution', 'user');
    }
    expect(sendDbEventLog).toHaveBeenCalledTimes(1);
    expect(sendDbEventLog).toHaveBeenCalledWith({
      action: 'update',
      docId: 'execution',
      prevDocument: posted,
      currentDocument: saved,
    });
  },
);

test.each(['save', 'post'] as const)(
  '%s delegates posted transaction rebuilding to the saveTr model method',
  async (action) => {
    const { models, execution } = postedSetup();
    const saveTr = jest
      .spyOn(models.JobExecutions, 'saveTr')
      .mockResolvedValue(execution as never);
    if (action === 'save') {
      await models.JobExecutions.saveJobExecution(input, 'user', 'execution');
    } else {
      await models.JobExecutions.postJobExecution('execution', 'user');
    }
    expect(saveTr).toHaveBeenCalledTimes(1);
    expect(saveTr).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'execution', status: 'posted' }),
      expect.objectContaining({ jobs: expect.any(Array) }),
      expect.any(Map),
      'user',
    );
  },
);

test('posting a posted execution updates its existing group without unit conversion or duplicate transactions', async () => {
  const { models, transactions, previous, posted, jobExecutions } =
    postedSetup();
  jest.mocked(sendTRPCMessage).mockClear();
  await models.JobExecutions.postJobExecution('execution', 'user');
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
    models.JobExecutions.postJobExecution('execution', 'user'),
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
  await models.JobExecutions.saveJobExecution(
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
  await models.JobExecutions.saveJobExecution(
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
    models.JobExecutions.saveJobExecution(input, 'user', 'execution'),
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
    models.JobExecutions.saveJobExecution(input, 'user', 'execution'),
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
    models.JobExecutions.saveJobExecution(input, 'user', 'execution'),
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
    models.JobExecutions.saveJobExecution(input, 'user', 'execution'),
  ).rejects.toThrow('changed outside this execution');
  expect(transactions.updatePTransaction).not.toHaveBeenCalled();
  expect(transactions.createPTransaction).not.toHaveBeenCalled();
});
