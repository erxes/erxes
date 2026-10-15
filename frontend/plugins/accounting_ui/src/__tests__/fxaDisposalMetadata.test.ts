import { JOURNALS_BY_JOURNAL } from '@/transactions/transaction-form/contants/defaultValues';
import { fxaDetailSchema } from '@/transactions/transaction-form/contants/transactionSchema';
import { TrJournalEnum } from '@/transactions/types/constants';
import { buildFxaDisposalPreviewSummaries } from '@/transactions/transaction-form/components/forms/hooks/useFxaDisposalFollowTrs';

jest.mock(
  'erxes-ui',
  () => ({ fixNum: (value: number) => Math.round(value * 10000) / 10000 }),
  { virtual: true },
);
jest.mock('ui-modules', () => ({ CustomerType: { CUSTOMER: 'customer' } }), {
  virtual: true,
});

describe('fixed asset disposal unit depreciation metadata', () => {
  const detail = {
    _id: 'detail-1',
    accountId: 'account-1',
    fixedAssetId: 'asset-1',
    count: 2,
    unitPrice: 100,
    amount: 200,
    followInfos: { preDeprecation: 20 },
  };

  it.each([
    TrJournalEnum.FXA_OUT,
    TrJournalEnum.FXA_MOVE,
    TrJournalEnum.FXA_SALE,
  ])(
    'preserves unit preDeprecation through %s defaults and validation',
    (journal) => {
      const doc = JOURNALS_BY_JOURNAL(journal, {
        _id: 'transaction-1',
        details: [detail],
      });
      const parsed = fxaDetailSchema.parse(doc.details?.[0]);
      expect(parsed.followInfos?.preDeprecation).toBe(20);
      expect(parsed.followInfos).not.toHaveProperty('accumulatedDepreciation');
      expect(doc.followInfos).not.toHaveProperty('fxaDisposalSummaries');
    },
  );

  it.each([0, 1, 2, 3])(
    'keeps unit metadata unchanged while previewing count %s',
    (count) => {
      const parsed = { ...detail, count };
      const summaries = buildFxaDisposalPreviewSummaries(
        [parsed],
        [
          {
            _id: 'asset-1',
            originalCost: 100,
            currentCount: 10,
            accumulatedDepreciation: 900,
            bookValue: 100,
          },
        ],
      );
      expect(parsed.followInfos.preDeprecation).toBe(20);
      if (count > 0) {
        expect(summaries[0].accumulatedDepreciation).toBe(20 * count);
        expect(summaries[0].bookValue).toBe(80 * count);
      } else {
        expect(summaries).toEqual([]);
      }
    },
  );

  it('preserves explicit zero and rejects negative unit depreciation', () => {
    const parsed = fxaDetailSchema.parse({
      ...detail,
      followInfos: { preDeprecation: 0 },
    });
    expect(parsed.followInfos?.preDeprecation).toBe(0);
    expect(
      buildFxaDisposalPreviewSummaries(
        [parsed],
        [
          {
            _id: 'asset-1',
            originalCost: 100,
            currentCount: 10,
            accumulatedDepreciation: 900,
          },
        ],
      )[0].accumulatedDepreciation,
    ).toBe(0);
    expect(
      fxaDetailSchema.safeParse({
        ...detail,
        followInfos: { preDeprecation: -1 },
      }).success,
    ).toBe(false);
  });
});
