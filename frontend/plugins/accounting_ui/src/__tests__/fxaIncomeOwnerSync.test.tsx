import { act, render, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { FxaIncomeOwnerRecordsSync } from '@/transactions/transaction-form/components/forms/FxaIncomeForm/FxaIncomeOwnerRecordsSheet';
import type { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';

jest.mock('erxes-ui', () => ({}), { virtual: true });
jest.mock('ui-modules', () => ({}), { virtual: true });

test('owner synchronization keeps detail metadata intact without creating a root detail array', () => {
  const { result } = renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        date: new Date(),
        trDocs: [
          {
            journal: TrJournalEnum.FXA_INCOME,
            details: [
              {
                _id: 'detail-1',
                fixedAssetId: 'asset-1',
                followInfos: { preDeprecation: 20, salvageValue: 5 },
              },
            ],
            extraData: {
              fxaOwnerRecords: [
                {
                  transactionDetailId: 'detail-1',
                  fixedAssetId: 'stale-asset',
                  count: 1,
                  ownerId: 'user-1',
                },
                { transactionDetailId: 'removed-detail', count: 1 },
              ],
            },
          },
        ],
      },
    }),
  );
  const form = result.current;
  const { unmount } = render(
    <FxaIncomeOwnerRecordsSync form={form} journalIndex={0} />,
  );
  expect(form.getValues('trDocs.0.extraData.fxaOwnerRecords')).toEqual([
    {
      transactionDetailId: 'detail-1',
      fixedAssetId: 'asset-1',
      count: 1,
      ownerId: 'user-1',
    },
  ]);
  expect(form.getValues('trDocs.0.details.0.followInfos')).toEqual({
    preDeprecation: 20,
    salvageValue: 5,
  });
  expect(form.getValues('trDocs.0.followInfos')).toBeUndefined();
  act(() => form.setValue('trDocs.0.details.0.followInfos.preDeprecation', 0));
  expect(form.getValues('trDocs.0.details.0.followInfos.preDeprecation')).toBe(
    0,
  );
  expect(form.getValues('trDocs.0.followInfos')).toBeUndefined();
  unmount();
});
