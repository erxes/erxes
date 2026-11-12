import { JOURNALS } from '../../@types/constants';
import {
  getPermittedTransactionJournals,
  getTransactionJournalPermissionAction,
} from '../transactionPermissions';

test.each([
  JOURNALS.FXA_INCOME,
  JOURNALS.FXA_CAPITAL,
  JOURNALS.FXA_REVALUATION,
])(
  '%s permissions include only its actual depreciation follows',
  async (journal) => {
    const allowed = getTransactionJournalPermissionAction(journal, 'read');
    const permitted = await getPermittedTransactionJournals(
      {
        checkPermission: async (action: string) => {
          if (action !== allowed) throw new Error('Permission denied');
        },
      },
      'read',
    );
    const follows =
      journal === JOURNALS.FXA_INCOME
        ? [JOURNALS.FXA_DEP_IN]
        : [JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEP_OUT];
    expect(permitted).toEqual([journal, ...follows]);
    expect(permitted).not.toContain(JOURNALS.FXA_DEP);
  },
);

test('ordinary depreciation remains visible through its own adjustment permission', async () => {
  const permitted = await getPermittedTransactionJournals(
    {
      checkPermission: async (action: string) => {
        if (action !== 'readAdjustFixedAssets')
          throw new Error('Permission denied');
      },
    },
    'read',
  );
  expect(permitted).toEqual([JOURNALS.FXA_DEP]);
  expect(
    getTransactionJournalPermissionAction(JOURNALS.FXA_DEP, 'manage'),
  ).toBe('manageAdjustFixedAssets');
  expect(
    getTransactionJournalPermissionAction(JOURNALS.FXA_DEP, 'remove'),
  ).toBe('removeAdjustFixedAssets');
});
