import { buildErkhetProductDocForTest } from '../erkhetReferenceMigration';
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
