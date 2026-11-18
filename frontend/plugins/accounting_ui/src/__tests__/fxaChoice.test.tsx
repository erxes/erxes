import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import {
  applyFxaChoice,
  applyFxaChoices,
} from '@/transactions/transaction-form/components/helpers/applyFxaChoice';
import { TFixedAssetChoice } from '@/settings/fixed-assets/components/chooser/types';
import { TAddTransactionGroup } from '@/transactions/transaction-form/types/JournalForms';
import { TrJournalEnum } from '@/transactions/types/constants';

const choice: TFixedAssetChoice = {
  asset: {
    _id: 'new-asset',
    code: 'PC',
    name: 'Computer',
    originalCost: 100,
    accountId: 'asset-account',
  },
  location: {
    branchId: 'chosen-branch',
    departmentId: 'chosen-department',
    remainder: 2,
    owners: [],
  },
  owner: { ownerId: 'custodian', code: 'serial', count: 1 },
};
const setup = (
  journal:
    | TrJournalEnum.FXA_OUT
    | TrJournalEnum.FXA_SALE = TrJournalEnum.FXA_OUT,
) =>
  renderHook(() =>
    useForm<TAddTransactionGroup>({
      defaultValues: {
        date: new Date('2026-01-01'),
        trDocs: [
          {
            journal,
            branchId: 'header-branch',
            departmentId: 'header-department',
            details: [
              {
                _id: 'detail',
                fixedAssetId: 'old-asset',
                accountId: 'revenue-account',
                count: 5,
                unitPrice: 700,
                followInfos: { preDeprecation: 20 },
              },
              { _id: 'sibling', count: 1 },
            ],
            extraData: {
              fxaOwnerRecords: [
                {
                  transactionDetailId: 'detail',
                  ownerId: 'old-owner',
                  count: 1,
                },
                {
                  transactionDetailId: 'sibling',
                  ownerId: 'other-owner',
                  count: 1,
                },
              ],
            },
          },
        ],
      },
    }),
  );

test('selection fills the exact location and custodian, limits count and clears the old unit depreciation', () => {
  const { result } = setup();
  act(() => applyFxaChoice(result.current, 0, 0, choice));
  expect(result.current.getValues('trDocs.0.details.0')).toMatchObject({
    fixedAssetId: 'new-asset',
    branchId: 'chosen-branch',
    departmentId: 'chosen-department',
    count: 1,
    unitPrice: 100,
    amount: 100,
    followInfos: { fixedAssetCode: 'PC', preDeprecation: undefined },
  });
  expect(
    result.current.getValues('trDocs.0.extraData.fxaOwnerRecords'),
  ).toEqual([
    expect.objectContaining({
      transactionDetailId: 'sibling',
      ownerId: 'other-owner',
    }),
    expect.objectContaining({
      transactionDetailId: 'detail',
      ownerId: 'custodian',
      code: 'serial',
      count: 1,
    }),
  ]);
});

test('sale selection preserves its revenue account and entered sale price', () => {
  const { result } = setup(TrJournalEnum.FXA_SALE);
  act(() => applyFxaChoice(result.current, 0, 0, choice));
  expect(result.current.getValues('trDocs.0.details.0')).toMatchObject({
    accountId: 'revenue-account',
    unitPrice: 700,
    amount: 700,
  });
});

test('choosing an unassigned location keeps sibling locations independent of obsolete header defaults', () => {
  const { result } = setup();
  act(() =>
    applyFxaChoice(result.current, 0, 0, {
      ...choice,
      location: { branchId: '', departmentId: '', remainder: 2, owners: [] },
    }),
  );
  expect(result.current.getValues('trDocs.0.branchId')).toBe('');
  expect(result.current.getValues('trDocs.0.departmentId')).toBe('');
  expect(result.current.getValues('trDocs.0.details.1')).toMatchObject({
    branchId: '',
    departmentId: '',
  });
});

test('reselecting the unchanged source preserves explicit zero depreciation', () => {
  const { result } = setup();
  act(() => {
    result.current.setValue('trDocs.0.details.0.fixedAssetId', 'new-asset');
    result.current.setValue('trDocs.0.details.0.branchId', 'chosen-branch');
    result.current.setValue(
      'trDocs.0.details.0.departmentId',
      'chosen-department',
    );
    result.current.setValue('trDocs.0.details.0.followInfos.preDeprecation', 0);
    applyFxaChoice(result.current, 0, 0, choice);
  });
  expect(
    result.current.getValues('trDocs.0.details.0.followInfos.preDeprecation'),
  ).toBe(0);
});

test.each([TrJournalEnum.FXA_OUT, TrJournalEnum.FXA_SALE])(
  'multiple choices insert distinct location details and preserve siblings for %s',
  (journal) => {
    const { result } = setup(journal);
    const second: TFixedAssetChoice = {
      ...choice,
      owner: undefined,
      location: {
        branchId: 'second-branch',
        departmentId: 'second-department',
        remainder: 3,
        owners: [],
      },
    };
    act(() => applyFxaChoices(result.current, 0, 0, [choice, second]));
    const details = result.current.getValues('trDocs.0.details');
    expect(details).toHaveLength(3);
    expect(details[0]).toMatchObject({
      _id: 'detail',
      branchId: 'chosen-branch',
      count: 1,
    });
    expect(details[1]).toMatchObject({
      fixedAssetId: 'new-asset',
      branchId: 'second-branch',
      departmentId: 'second-department',
      count: 1,
      accountId:
        journal === TrJournalEnum.FXA_SALE
          ? 'revenue-account'
          : 'asset-account',
      unitPrice: journal === TrJournalEnum.FXA_SALE ? 700 : 100,
      amount: journal === TrJournalEnum.FXA_SALE ? 700 : 100,
      followInfos: { fixedAssetCode: 'PC', preDeprecation: undefined },
    });
    expect(details[1]._id).not.toBe('detail');
    expect(details[1]._id).not.toBe('sibling');
    expect(details[2]._id).toBe('sibling');
    expect(
      result.current.getValues('trDocs.0.extraData.fxaOwnerRecords'),
    ).toHaveLength(2);
  },
);

test('multiple custodian choices reserve quantity before retaining the edited row count', () => {
  const { result } = setup();
  const sharedLocation = {
    branchId: 'branch',
    departmentId: 'dept',
    remainder: 2,
    owners: [],
  };
  const first = {
    ...choice,
    location: sharedLocation,
    owner: { ownerId: 'first', code: 'one', count: 2 },
  };
  const second = {
    ...choice,
    location: sharedLocation,
    owner: { ownerId: 'second', code: 'two', count: 1 },
  };
  act(() => applyFxaChoices(result.current, 0, 0, [first, second]));
  expect(
    result.current
      .getValues('trDocs.0.details')
      .slice(0, 2)
      .map((detail) => detail.count),
  ).toEqual([1, 1]);
  expect(
    result.current
      .getValues('trDocs.0.extraData.fxaOwnerRecords')
      .filter((record) => record.transactionDetailId !== 'sibling')
      .map((record) => record.count),
  ).toEqual([1, 1]);
});
