import type { IModels } from '~/connectionResolvers';
import { ACCOUNT_JOURNALS, JOURNALS } from '../@types/constants';
import type { ITransaction } from '../@types/transaction';

const generalAccounts = [
  ACCOUNT_JOURNALS.MAIN,
  ACCOUNT_JOURNALS.INV_FOLLOW,
  ACCOUNT_JOURNALS.FXA_FOLLOW,
];
const inventoryAccounts = [ACCOUNT_JOURNALS.INVENTORY];
const fixedAssetAccounts = [ACCOUNT_JOURNALS.FIXED_ASSET];
const exchangeAccounts = [ACCOUNT_JOURNALS.EXCHANGE_DIFF];

const allowedAccountJournals: Record<string, readonly string[]> = {
  [JOURNALS.MAIN]: generalAccounts,
  [JOURNALS.TAX]: [ACCOUNT_JOURNALS.TAX],
  [JOURNALS.CASH]: [ACCOUNT_JOURNALS.CASH],
  [JOURNALS.BANK]: [ACCOUNT_JOURNALS.BANK],
  [JOURNALS.RECEIVABLE]: [ACCOUNT_JOURNALS.DEBT],
  [JOURNALS.PAYABLE]: [ACCOUNT_JOURNALS.DEBT],
  [JOURNALS.INV_INCOME]: inventoryAccounts,
  [JOURNALS.INV_OUT]: inventoryAccounts,
  [JOURNALS.INV_JUSTIFY]: inventoryAccounts,
  [JOURNALS.INV_MOVE]: inventoryAccounts,
  [JOURNALS.INV_SALE]: [ACCOUNT_JOURNALS.INV_FOLLOW],
  [JOURNALS.INV_SALE_RETURN]: [ACCOUNT_JOURNALS.INV_FOLLOW],
  [JOURNALS.FXA_INCOME]: fixedAssetAccounts,
  [JOURNALS.FXA_OUT]: fixedAssetAccounts,
  [JOURNALS.FXA_MOVE]: fixedAssetAccounts,
  [JOURNALS.FXA_CAPITAL]: fixedAssetAccounts,
  [JOURNALS.FXA_REVALUATION]: fixedAssetAccounts,
  [JOURNALS.FXA_SALE]: [ACCOUNT_JOURNALS.FXA_FOLLOW],
  [JOURNALS.FXA_DEP]: [
    ACCOUNT_JOURNALS.FXA_FOLLOW,
    ACCOUNT_JOURNALS.FIXED_ASSET,
  ],
  [JOURNALS.FXA_DEFERRED_TAX]: [...generalAccounts, ACCOUNT_JOURNALS.TAX],
  [JOURNALS.EXCHANGE_DIFF]: exchangeAccounts,
  [JOURNALS.CLOSING]: [...generalAccounts, ACCOUNT_JOURNALS.TAX],
};

const getAllowedAccountJournals = (doc: ITransaction): readonly string[] => {
  if (doc.journal === JOURNALS.EXCHANGE_DIFF && doc.contentId) {
    if (doc.contentType === 'accounting:adjustFundRate') {
      return [
        ...exchangeAccounts,
        ACCOUNT_JOURNALS.CASH,
        ACCOUNT_JOURNALS.BANK,
      ];
    }
    if (doc.contentType === 'accounting:adjustDebtRate') {
      return [...exchangeAccounts, ACCOUNT_JOURNALS.DEBT];
    }
  }

  if (
    !Object.prototype.hasOwnProperty.call(allowedAccountJournals, doc.journal)
  ) {
    throw new Error(`Unsupported journal: ${doc.journal}`);
  }
  return allowedAccountJournals[doc.journal];
};

export const validateTransactionAccounts = async (
  models: IModels,
  doc: ITransaction,
): Promise<void> => {
  const allowed = getAllowedAccountJournals(doc);
  const accountIds = [
    ...new Set(doc.details.map(({ accountId }) => accountId)),
  ];
  if (!accountIds.length) return;
  if (accountIds.some((id) => !id)) {
    throw new Error(
      `Choose an account for every detail in the ${doc.journal} journal.`,
    );
  }

  const accounts = await models.Accounts.find(
    { _id: { $in: accountIds } },
    { _id: 1, code: 1, journal: 1, isTemp: 1 },
  ).lean();
  const accountsById = new Map(
    accounts.map((account) => [account._id, account]),
  );
  const isClosingAdjustment =
    doc.journal === JOURNALS.CLOSING &&
    doc.contentType === 'accounting:adjustClosing' &&
    !!doc.contentId;

  for (const id of accountIds) {
    const account = accountsById.get(id);
    if (!account) throw new Error(`Account ${id} not found.`);
    // Closing reverses temporary balances from their original accounts.
    if (isClosingAdjustment && account.isTemp) continue;
    if (!allowed.includes(account.journal)) {
      throw new Error(
        `Account ${account.code || id} (${
          account.journal || 'no journal'
        }) is not allowed in the ${
          doc.journal
        } journal. Use an account with journal: ${allowed.join(', ')}.`,
      );
    }
  }
};
