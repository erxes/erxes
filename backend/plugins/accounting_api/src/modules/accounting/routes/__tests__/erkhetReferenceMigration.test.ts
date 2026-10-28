import {
  buildErkhetProductDocForTest,
  syncErkhetJobs,
} from '../erkhetReferenceMigration';
import {
  buildErkhetContactQueryForTest,
  findOrCreateErkhetContact,
  normalizeErkhetBatchDocsForTest,
} from '../erkhetMigration';
import * as trpc from 'erxes-api-shared/utils/trpc';
import type { IModels } from '~/connectionResolvers';

describe('Erkhet product reference migration', () => {
  it('matches vendor companies by their source brand name', () => {
    expect(
      buildErkhetContactQueryForTest({
        type: 'company',
        code: 'VENDOR-001',
        name: 'Vendor company',
        phone: '99112233',
        email: 'vendor@example.com',
      }),
    ).toEqual({
      $or: [
        { code: 'VENDOR-001' },
        { primaryName: 'Vendor company' },
        { names: { $in: ['Vendor company'] } },
        { primaryPhone: '99112233' },
        { phones: { $in: ['99112233'] } },
      ],
    });
  });

  it('preserves deleted status and resolved vendor/custom property values', () => {
    expect(
      buildErkhetProductDocForTest({
        product: {
          code: ' INV_*001 ',
          name: 'Deleted inventory',
          status: 'deleted',
          vendor: 'Vendor company',
          customFieldsData: [
            {
              field: 'group-property-id',
              value: 'Retail',
              stringValue: 'Retail',
            },
          ],
        },
        categoryId: 'category-id',
        vendorId: 'vendor-company-id',
      }),
    ).toEqual(
      expect.objectContaining({
        code: 'INV001',
        status: 'deleted',
        vendorId: 'vendor-company-id',
        customFieldsData: [
          {
            field: 'group-property-id',
            value: 'Retail',
            stringValue: 'Retail',
          },
        ],
      }),
    );
  });
});

describe('Erkhet contact migration writes', () => {
  const send = jest.spyOn(trpc, 'sendTRPCMessage');
  const contact = {
    type: 'company' as const,
    code: 'COMPANY-1',
    phone: '99112233',
    name: 'Updated name',
  };
  beforeEach(() => send.mockReset());
  afterAll(() => send.mockRestore());

  it.each(['code', 'primaryPhone'])(
    'updates a company matched by %s',
    async () => {
      send
        .mockResolvedValueOnce([{ _id: 'company-1' }])
        .mockResolvedValueOnce({});
      const result = await findOrCreateErkhetContact({
        subdomain: 'test',
        userId: 'user-1',
        contact,
        updateExisting: true,
      });
      expect(result.action).toBe('update');
      expect(send).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          action: 'updateCompany',
          input: {
            _id: 'company-1',
            doc: expect.objectContaining({ primaryName: 'Updated name' }),
          },
        }),
      );
    },
  );

  it('does not update an identity-matched company during dry run', async () => {
    send.mockResolvedValueOnce([{ _id: 'company-1' }]);
    await findOrCreateErkhetContact({
      subdomain: 'test',
      userId: 'user-1',
      contact,
      updateExisting: true,
      dryRun: true,
    });
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'query' }),
    );
  });

  it('does not create a missing company during dry run', async () => {
    send.mockResolvedValue([]);
    const result = await findOrCreateErkhetContact({
      subdomain: 'test',
      userId: 'user-1',
      contact,
      dryRun: true,
    });
    expect(result._id).toBe('dry-run:company:COMPANY-1');
    expect(
      send.mock.calls.every(([request]) => request.method === 'query'),
    ).toBe(true);
  });

  it('keeps a name-only vendor match without overwriting its identity', async () => {
    send.mockResolvedValueOnce([]).mockResolvedValueOnce([{ _id: 'vendor-1' }]);
    const result = await findOrCreateErkhetContact({
      subdomain: 'test',
      userId: 'user-1',
      contact,
      updateExisting: true,
    });
    expect(result.action).toBe('skip');
    expect(send).toHaveBeenCalledTimes(2);
  });

  it('propagates dry run through transaction normalization without contact or tax writes', async () => {
    send.mockResolvedValue([]);
    const find = jest.fn(() => ({ lean: jest.fn().mockResolvedValue([]) }));
    const create = jest.fn();
    const updateOne = jest.fn();
    const models = { CtaxRows: { find, create, updateOne } };
    const docs = await normalizeErkhetBatchDocsForTest(
      'test',
      models as unknown as IModels,
      {
        externalPtrId: 'parent-1',
        trDocs: [
          {
            date: new Date('2026-01-01'),
            journal: 'main',
            details: [],
            customerId: 'COMPANY-1',
            extraData: {
              erkhetCustomer: contact,
              erkhetCtaxRows: [{ number: '1', name: 'Tax', percent: 1 }],
            },
          },
        ],
      },
      'user-1',
      true,
    );
    expect(docs[0].customerId).toBe('dry-run:company:COMPANY-1');
    expect(create).not.toHaveBeenCalled();
    expect(updateOne).not.toHaveBeenCalled();
    expect(
      send.mock.calls.every(([request]) => request.method !== 'mutation'),
    ).toBe(true);
  });
});

describe('Erkhet job references', () => {
  let send: jest.SpyInstance;
  beforeAll(() => {
    send = jest.spyOn(trpc, 'sendTRPCMessage');
  });
  const createJob = jest.fn();
  const updateJob = jest.fn();
  const findOne = jest.fn();
  const getAccount = jest.fn();
  const models = {
    Jobs: { findOne, createJob, updateJob },
    Accounts: { getAccount },
  } as unknown as IModels;
  const job = {
    code: 'ERKHET-TECHCARD-7',
    name: 'Assembly',
    durationType: 'real' as const,
    inputs: [{ productCode: 'RAW_*1', quantity: 2, uom: 'kg' }],
    outputs: [{ productCode: 'FINAL', quantity: 1, costRatio: 1 }],
    laborCosts: [{ name: 'Labor', amount: 50, accountCode: '6001' }],
  };
  const sync = (dryRun = false, jobs = [job]) =>
    syncErkhetJobs({
      models,
      subdomain: 'tenant',
      userId: 'user',
      dryRun,
      jobs,
    });
  beforeEach(() => {
    jest.clearAllMocks();
    send.mockResolvedValue([
      { _id: 'raw', code: 'RAW1' },
      { _id: 'final', code: 'FINAL' },
    ]);
    findOne.mockResolvedValue(null);
    getAccount.mockResolvedValue({ _id: 'account' });
    createJob.mockResolvedValue({ _id: 'job' });
    updateJob.mockResolvedValue({ _id: 'job' });
  });
  afterAll(() => send.mockRestore());

  it('resolves canonical product codes and tenant cost accounts before saving', async () => {
    expect(await sync()).toEqual([
      { type: 'job', code: job.code, action: 'create', _id: 'job' },
    ]);
    expect(getAccount).toHaveBeenCalledWith({ code: '6001', status: 'active' });
    expect(createJob).toHaveBeenCalledWith(
      expect.objectContaining({
        inputs: [{ productId: 'raw', quantity: 2, uom: 'kg' }],
        outputs: [{ productId: 'final', quantity: 1, costRatio: 1, uom: '' }],
        laborCosts: [{ name: 'Labor', amount: 50, accountId: 'account' }],
      }),
      'user',
    );
  });
  it('updates the same source code on retry', async () => {
    findOne.mockResolvedValue({ _id: 'job' });
    expect((await sync())[0].action).toBe('update');
    expect(updateJob).toHaveBeenCalledWith(
      expect.objectContaining({ _id: 'job', code: job.code }),
      'user',
    );
    expect(createJob).not.toHaveBeenCalled();
  });
  it('validates dry-run dependencies without writing', async () => {
    send.mockResolvedValue([]);
    const rows = await syncErkhetJobs({
      models,
      subdomain: 'tenant',
      dryRun: true,
      jobs: [job],
      productIdsByCode: { RAW1: 'dry-run:RAW1', FINAL: 'dry-run:FINAL' },
    });
    expect(rows[0].action).toBe('create');
    expect(getAccount).toHaveBeenCalled();
    expect(createJob).not.toHaveBeenCalled();
    expect(updateJob).not.toHaveBeenCalled();
  });
  it.each([0, -1, Infinity, NaN])(
    'rejects invalid quantity %s without saving',
    async (quantity) => {
      const rows = await sync(false, [
        { ...job, inputs: [{ ...job.inputs[0], quantity }] },
      ]);
      expect(rows[0].action).toBe('error');
      expect(createJob).not.toHaveBeenCalled();
    },
  );
  it('rejects missing products and missing cost accounts during dry run', async () => {
    send.mockResolvedValue([]);
    expect((await sync(true))[0].error).toContain('product not found');
    send.mockResolvedValue([
      { _id: 'raw', code: 'RAW1' },
      { _id: 'final', code: 'FINAL' },
    ]);
    getAccount.mockRejectedValue(new Error('Account not found'));
    expect((await sync(true))[0].error).toBe('Account not found');
    expect(createJob).not.toHaveBeenCalled();
  });
  it('rejects zero output allocation and keeps later successful rows', async () => {
    const invalid = { ...job, outputs: [{ ...job.outputs[0], costRatio: 0 }] };
    const rows = await sync(false, [
      invalid,
      { ...job, code: 'ERKHET-TECHCARD-8' },
    ]);
    expect(rows.map((row) => row.action)).toEqual(['error', 'create']);
    expect(createJob).toHaveBeenCalledTimes(1);
  });
});
