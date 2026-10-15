/// <reference types="jest" />

import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  JOURNALS,
} from '~/modules/accounting/@types/constants';
import { ITransaction } from '~/modules/accounting/@types/transaction';
import { dealToTrs } from '../dealToTrs';
import { orderToTrs } from '../orderToTrs';

jest.mock('erxes-api-shared/utils', () => ({
  fixNum: (value: number) => value,
  sendTRPCMessage: jest.fn().mockResolvedValue([]),
}));

jest.mock('../taxRules', () => ({
  getDealPaymentTypes: jest.fn().mockResolvedValue([]),
  getOrderPaymentTypes: jest.fn().mockResolvedValue([]),
  calcDealPreTaxPercent: () => ({
    itemAmountPrePercent: 0,
    preTaxPaymentTypes: [],
  }),
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

describe.each(['deal', 'order'] as const)('%s sale payment sync', (source) => {
  const createPTransaction = jest.fn<
    Promise<ITransaction[]>,
    [ITransaction[], string, object]
  >();
  const findAccount = jest.fn();
  const models = {
    Transactions: {
      find: jest.fn(() => ({ lean: async () => [] })),
      createPTransaction,
    },
    Accounts: {
      findOne: findAccount,
    },
  } as unknown as IModels;

  const sync = async (
    paidAmount: number,
    paymentAccountId?: string,
    debtAccountId = '',
  ) => {
    const config: Parameters<typeof orderToTrs>[0]['config'] = {
      dateRule: 'alwaysNow',
      saleAccountId: 'sale-account',
      saleOutAccountId: 'inventory-account',
      saleCostAccountId: 'cost-account',
      branchId: 'branch',
      departmentId: 'department',
      hasVat: false,
      hasCtax: false,
      vatRowId: '',
      ctaxRowId: '',
      payments:
        paymentAccountId === undefined
          ? {}
          : { cash: { accountId: paymentAccountId } },
      defaultPayment: { accountId: debtAccountId },
      defaultNegPayment: { accountId: '' },
    };
    const context = { subdomain: 'tenant', models, userId: 'user', config };
    if (source === 'order') {
      await orderToTrs({
        ...context,
        order: {
          _id: 'order',
          items: [{ productId: 'product', count: 1, unitPrice: 100 }],
          cashAmount: paidAmount,
        },
      });
    } else {
      await dealToTrs({
        ...context,
        deal: {
          _id: 'deal',
          productsData: [
            { productId: 'product', quantity: 1, amount: 100, tickUsed: true },
          ],
          paymentsData: { cash: { amount: paidAmount } },
        },
      });
    }
    return createPTransaction.mock.calls[0][0];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    createPTransaction.mockResolvedValue([]);
    findAccount.mockImplementation(({ _id }: { _id: string }) => ({
      lean: async () =>
        _id === 'missing-account'
          ? null
          : {
              _id,
              journal:
                _id === 'debt-account'
                  ? ACCOUNT_JOURNALS.DEBT
                  : ACCOUNT_JOURNALS.CASH,
            },
    }));
  });

  it.each([undefined, '', '   ', 'missing-account'])(
    'keeps the sale without replacing an unconfigured payment (%s) with debt',
    async (accountId) => {
      const docs = await sync(100, accountId, 'debt-account');
      expect(docs).toHaveLength(1);
      expect(docs[0]).toMatchObject({
        journal: JOURNALS.INV_SALE,
        details: [{ accountId: 'sale-account', amount: 100 }],
      });
    },
  );

  it('records only the actual unpaid remainder as debt when a paid amount is skipped', async () => {
    const docs = await sync(60, '', 'debt-account');
    expect(docs).toHaveLength(2);
    expect(docs[1]).toMatchObject({
      journal: JOURNALS.RECEIVABLE,
      details: [{ accountId: 'debt-account', amount: 40 }],
    });
  });

  it('keeps the sale when the unpaid remainder has no configured debt account', async () => {
    const docs = await sync(0);
    expect(docs).toHaveLength(1);
    expect(docs[0].journal).toBe(JOURNALS.INV_SALE);
    expect(findAccount).not.toHaveBeenCalled();
  });

  it('records configured payments normally', async () => {
    const docs = await sync(100, 'cash-account');
    expect(docs).toHaveLength(2);
    expect(docs[1]).toMatchObject({
      journal: JOURNALS.CASH,
      details: [{ accountId: 'cash-account', amount: 100 }],
    });
  });
});
