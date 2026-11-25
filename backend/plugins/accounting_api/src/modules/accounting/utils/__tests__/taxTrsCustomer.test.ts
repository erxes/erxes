import type { IModels } from '~/connectionResolvers';
import { JOURNALS, TR_FOLLOW_TYPES } from '../../@types/constants';
import type {
  ITransaction,
  ITransactionDocument,
} from '../../@types/transaction';
import { validateTaxCustomerConfig } from '../taxCustomerConfig';
import TaxTrs from '../taxTrs';

jest.mock('erxes-api-shared/utils', () => ({}));

const source = {
  _id: 'source',
  parentId: 'voucher',
  ptrId: 'pointer',
  date: new Date('2026-11-25'),
  journal: JOURNALS.MAIN,
  customerType: 'customer',
  customerId: 'buyer',
  hasVat: true,
  hasCtax: true,
  vatRowId: 'vat-row',
  ctaxRowId: 'city-tax-row',
  vatAmount: 10,
  ctaxAmount: 2,
  details: [{ _id: 'sale', accountId: 'sale-account', amount: 100 }],
} as ITransactionDocument;

const makeModels = (
  contacts: { VatCustomer?: unknown; CtaxCustomer?: unknown },
  updating = false,
) => {
  const configs: Record<string, unknown> = {
    HasVat: true,
    HasCtax: true,
    VatPayableAccount: 'vat-account',
    VatAfterPayableAccount: 'deferred-vat-account',
    CtaxPayableAccount: 'city-tax-account',
    ...contacts,
  };
  const raw = {
    Configs: {
      getConfigValue: jest.fn(async (code: string) => configs[code] ?? null),
    },
    VatRows: { getVatRow: jest.fn(async () => ({ percent: 10 })) },
    CtaxRows: { getCtaxRow: jest.fn(async () => ({ percent: 2 })) },
    Transactions: {
      find: jest.fn(({ originType }: { originType: string }) => ({
        lean: async () => (updating ? [{ _id: originType }] : []),
      })),
      createTransaction: jest.fn(async (doc: ITransaction) => doc),
      updateTransaction: jest.fn(async (_id: string, doc: ITransaction) => ({
        ...doc,
        _id,
      })),
    },
  };

  return { models: raw as unknown as IModels, transactions: raw.Transactions };
};

it('uses independent configured contacts on generated deferred VAT and city-tax rows', async () => {
  const VatCustomer = { customerType: 'company', customerId: 'vat-office' };
  const CtaxCustomer = { customerType: 'user', customerId: 'city-office' };
  const { models } = makeModels({ VatCustomer, CtaxCustomer });
  const taxTrs = new TaxTrs(
    models,
    'operator',
    { ...source, afterVat: true },
    'ct',
  );

  await taxTrs.checkTaxValidation();
  const rows = await taxTrs.doTaxTrs(source);

  expect(rows).toEqual([
    expect.objectContaining({
      ...VatCustomer,
      originType: TR_FOLLOW_TYPES.VAT,
      details: [
        expect.objectContaining({
          accountId: 'deferred-vat-account',
          amount: 10,
        }),
      ],
    }),
    expect.objectContaining({
      ...CtaxCustomer,
      originType: TR_FOLLOW_TYPES.CTAX,
      details: [
        expect.objectContaining({ accountId: 'city-tax-account', amount: 2 }),
      ],
    }),
  ]);
});

it('restores the source contact when clearing the setup and updating the existing tax rows', async () => {
  const { models, transactions } = makeModels({ VatCustomer: null }, true);
  const taxTrs = new TaxTrs(models, 'operator', source, 'ct');

  await taxTrs.checkTaxValidation();
  const rows = await taxTrs.doTaxTrs(source);

  expect(transactions.createTransaction).not.toHaveBeenCalled();
  expect(rows).toEqual(
    [TR_FOLLOW_TYPES.VAT, TR_FOLLOW_TYPES.CTAX].map((_id) =>
      expect.objectContaining({
        _id,
        customerType: source.customerType,
        customerId: source.customerId,
      }),
    ),
  );
});

it.each(['VatCustomer', 'CtaxCustomer'])(
  'requires a complete contact in %s',
  (code) => {
    expect(() =>
      validateTaxCustomerConfig(code, { customerType: 'company' }),
    ).toThrow('customerId');
    expect(() =>
      validateTaxCustomerConfig(code, {
        customerType: 'unknown',
        customerId: 'id',
      }),
    ).toThrow('customerType');
    expect(() => validateTaxCustomerConfig(code, null)).not.toThrow();
  },
);
