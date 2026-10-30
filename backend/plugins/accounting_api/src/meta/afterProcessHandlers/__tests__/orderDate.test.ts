/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import { orderToTrs } from '../orderToTrs';
import { orderToReturnTrs } from '../orderToReturnTrs';
import { saveSaleTransactions } from '../saveSaleTransactions';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number) => value,
}));

jest.mock('../saveSaleTransactions', () => ({
  saveSaleTransactions: jest.fn(),
}));

jest.mock('../taxRules', () => ({
  getOrderPaymentTypes: jest.fn().mockResolvedValue([]),
  calcOrderPreTaxPercent: () => ({
    itemAmountPrePercent: 0,
    preTaxPaymentTypes: [],
  }),
  getProductsByIds: jest.fn().mockResolvedValue([]),
  calcAccountingProductsTaxRule: jest.fn().mockResolvedValue({
    productIdsByVatRule: new Set(),
    productIdsByCtaxRule: new Set(),
    ctaxRuleByProductId: {},
  }),
  ensureCtaxRowByProductRule: jest.fn().mockResolvedValue(undefined),
  subtractPreTaxAmount: (amount: number) => amount,
}));

jest.mock('../utils', () => ({
  getJournal: jest.fn().mockResolvedValue({
    side: 'dt',
    accountId: 'cash-account',
    lastAmount: 100,
    journal: 'cash',
  }),
}));

describe('POS order accounting date', () => {
  const find = jest.fn();
  const models = { Transactions: { find } } as unknown as IModels;
  const config: Parameters<typeof orderToTrs>[0]['config'] = {
    saleAccountId: 'sale',
    saleOutAccountId: 'inventory',
    saleCostAccountId: 'cost',
    branchId: 'branch',
    departmentId: 'department',
    hasVat: false,
    hasCtax: false,
    vatRowId: '',
    ctaxRowId: '',
    payments: { cash: { accountId: 'cash-account' } },
    defaultPayment: { accountId: '' },
    defaultNegPayment: { accountId: '' },
  };
  const sync = (
    paidDate?: string | null,
    items = [{ productId: 'product', count: 1, unitPrice: 100 }],
  ) =>
    orderToTrs({
      subdomain: 'tenant',
      models,
      userId: 'user',
      config,
      order: {
        _id: 'order',
        paidDate,
        cashAmount: 100,
        items,
      },
    });

  beforeEach(() => jest.clearAllMocks());

  it.each([undefined, null, ''])(
    'rejects orders without paidDate (%s)',
    async (paidDate) => {
      await expect(sync(paidDate)).rejects.toThrow(
        'POS order paidDate is required',
      );
      expect(find).not.toHaveBeenCalled();
      expect(saveSaleTransactions).not.toHaveBeenCalled();
    },
  );

  it.each([false, true])(
    'uses paidDate for sale and payment rows (resync=%s)',
    async (resync) => {
      find.mockReturnValue({ lean: async () => [] });
      find.mockReturnValueOnce({
        lean: async () =>
          resync
            ? [
                {
                  _id: 'sale',
                  ptrId: 'pointer',
                  parentId: 'parent',
                  date: new Date('2026-10-01T00:00:00Z'),
                },
              ]
            : [],
      });
      const paidDate = '2026-10-20T08:00:00.000Z';
      await sync(paidDate);
      const { docs, parentId } =
        jest.mocked(saveSaleTransactions).mock.calls[0][0];
      expect(docs).toHaveLength(2);
      expect(docs.map((doc) => doc.date)).toEqual([
        new Date(paidDate),
        new Date(paidDate),
      ]);
      expect(parentId).toBe(resync ? 'parent' : undefined);
    },
  );

  it('rejects an invalid paidDate before accounting reads', async () => {
    await expect(sync('invalid')).rejects.toThrow(
      'POS order paidDate is invalid',
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('rejects an order without items before accounting reads', async () => {
    await expect(sync('2026-10-20T08:00:00Z', [])).rejects.toThrow(
      'POS order has no items',
    );
    expect(find).not.toHaveBeenCalled();
  });
});

describe('POS order return accounting date', () => {
  const find = jest.fn();
  const findOne = jest.fn();
  const createPTransaction = jest.fn();
  const updatePTransaction = jest.fn();
  const models = {
    Transactions: { find, findOne, createPTransaction, updatePTransaction },
  } as unknown as IModels;
  const sync = (returnInfo?: { returnAt?: string | null }) =>
    orderToReturnTrs({
      models,
      userId: 'user',
      order: { _id: 'order', returnInfo },
      config: {
        defaultPayment: { accountId: 'cash-account' },
        returnType: 'fullTr',
      },
    });

  beforeEach(() => jest.clearAllMocks());

  it.each([undefined, {}, { returnAt: null }, { returnAt: '' }])(
    'rejects returns without returnAt (%j)',
    async (returnInfo) => {
      await expect(sync(returnInfo)).rejects.toThrow(
        'POS order returnInfo.returnAt is required',
      );
      expect(find).not.toHaveBeenCalled();
      expect(findOne).not.toHaveBeenCalled();
      expect(createPTransaction).not.toHaveBeenCalled();
      expect(updatePTransaction).not.toHaveBeenCalled();
    },
  );

  it.each([false, true])(
    'uses returnAt for return and refund rows (resync=%s)',
    async (resync) => {
      find.mockReturnValue([]);
      find.mockReturnValueOnce({
        lean: async () =>
          resync
            ? [
                {
                  _id: 'return',
                  parentId: 'parent',
                  ptrId: 'pointer',
                  date: new Date('2026-10-01T00:00:00Z'),
                },
              ]
            : [],
      });
      if (resync) find.mockReturnValueOnce({ lean: async () => [] });
      findOne.mockReturnValue({
        lean: async () => ({
          _id: 'sale',
          details: [{ accountId: 'sale-account', amount: 100 }],
        }),
      });
      const returnAt = '2026-10-21T09:00:00.000Z';
      await sync({ returnAt });
      const docs = resync
        ? updatePTransaction.mock.calls[0][1]
        : createPTransaction.mock.calls[0][0];
      expect(docs).toHaveLength(2);
      expect(docs.map((doc: { date: Date }) => doc.date)).toEqual([
        new Date(returnAt),
        new Date(returnAt),
      ]);
      if (resync) expect(updatePTransaction.mock.calls[0][0]).toBe('parent');
    },
  );

  it('rejects an invalid returnAt before accounting reads', async () => {
    await expect(sync({ returnAt: 'invalid' })).rejects.toThrow(
      'POS order returnInfo.returnAt is invalid',
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('rejects a return without an original sale before writes', async () => {
    find.mockReturnValue({ lean: async () => [] });
    findOne.mockReturnValue({ lean: async () => null });
    await expect(sync({ returnAt: '2026-10-21T09:00:00Z' })).rejects.toThrow(
      'POS order sale transaction was not found',
    );
    expect(createPTransaction).not.toHaveBeenCalled();
    expect(updatePTransaction).not.toHaveBeenCalled();
  });
});
