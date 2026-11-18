import { JOURNALS_BY_JOURNAL } from '@/transactions/transaction-form/contants/defaultValues';
import {
  transactionGroupSchema,
  trDocSchema,
} from '@/transactions/transaction-form/contants/transactionSchema';
import { cleanTrDocs } from '@/transactions/transaction-form/components/utils';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('react-i18next', () => ({
  getI18n: () => ({ t: (value: string) => value }),
}));

jest.mock('ui-modules', () => ({ CustomerType: { CUSTOMER: 'customer' } }));

const journal = (type: TrJournalEnum, manual: boolean) =>
  JOURNALS_BY_JOURNAL(type, {
    _id: 'transaction',
    customerType: 'customer',
    customerId: 'customer',
    side: 'dt',
    hasVat: manual,
    isHandleVat: manual,
    vatRowId: manual ? 'vat-row' : undefined,
    vatAmount: manual ? 10 : 0,
    hasCtax: manual,
    isHandleCtax: manual,
    ctaxRowId: manual ? 'ctax-row' : undefined,
    ctaxAmount: manual ? 2 : 0,
    details: [
      {
        _id: 'detail',
        accountId: 'account',
        productId: 'product',
        count: 1,
        unitPrice: 100,
        amount: 100,
      },
    ],
  });

it.each([TrJournalEnum.INV_INCOME, TrJournalEnum.CASH, TrJournalEnum.MAIN])(
  '%s preserves API tax flags through initialization, validation and mutation serialization',
  (type) => {
    for (const manual of [false, true]) {
      const parsed = transactionGroupSchema.parse({
        date: new Date('2026-11-11T06:00:00.000Z'),
        status: 'complete',
        trDocs: [journal(type, manual)],
      });
      const [payload] = cleanTrDocs(parsed);

      expect(payload).toMatchObject({
        isHandleVat: manual,
        isHandleCtax: manual,
        vatAmount: manual ? 10 : 0,
        ctaxAmount: manual ? 2 : 0,
      });
      expect(payload).not.toHaveProperty('handleVat');
      expect(payload).not.toHaveProperty('handleCtax');
    }
  },
);

it('requires an amount when VAT is entered manually', () => {
  const result = trDocSchema.safeParse({
    ...journal(TrJournalEnum.INV_INCOME, true),
    vatAmount: 0,
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: ['vatAmount'] }),
      ]),
    );
  }
});
