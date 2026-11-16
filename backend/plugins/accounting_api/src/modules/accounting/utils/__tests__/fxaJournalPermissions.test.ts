import { JOURNALS } from '../../@types/constants';
import {
  getPermittedTransactionJournals,
  getTransactionJournalPermissionAction,
} from '../transactionPermissions';

test.each(
  [JOURNALS.FXA_INCOME, JOURNALS.FXA_CAPITAL, JOURNALS.FXA_REVALUATION].flatMap(
    (journal) =>
      (['read', 'manage', 'remove'] as const).map(
        (mode) => [journal, mode] as const,
      ),
  ),
)('%s %s permission includes its generated journals', async (journal, mode) => {
  const allowed = getTransactionJournalPermissionAction(journal, mode);
  const permitted = await getPermittedTransactionJournals(
    {
      checkPermission: async (action: string) => {
        if (action !== allowed) throw new Error('Permission denied');
      },
    },
    mode,
  );
  const follows =
    journal === JOURNALS.FXA_INCOME
      ? [JOURNALS.FXA_DEP_IN, JOURNALS.FXA_DEFERRED_TAX]
      : [
          JOURNALS.FXA_DEP_IN,
          JOURNALS.FXA_DEP_OUT,
          JOURNALS.FXA_DEFERRED_TAX,
          ...(journal === JOURNALS.FXA_REVALUATION
            ? [JOURNALS.FXA_REVALUATION_RESULT]
            : []),
        ];
  expect(permitted).toEqual([journal, ...follows]);
  expect(permitted).not.toContain(JOURNALS.FXA_DEP);
});

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
  expect(permitted).toEqual([JOURNALS.FXA_DEP, JOURNALS.FXA_DEFERRED_TAX]);
  expect(
    getTransactionJournalPermissionAction(JOURNALS.FXA_DEP, 'manage'),
  ).toBe('manageAdjustFixedAssets');
  expect(
    getTransactionJournalPermissionAction(JOURNALS.FXA_DEP, 'remove'),
  ).toBe('removeAdjustFixedAssets');
});
