import { IUserDocument } from 'erxes-api-shared/core-types';
import { JOURNALS } from '../@types/constants';

type TTransactionPermissionMode = 'read' | 'manage' | 'remove';
type TCheckPermission = (action: string) => Promise<void>;

type TPermissionContext = {
  checkPermission: TCheckPermission;
  user?: IUserDocument;
};

export const TRANSACTION_PERMISSION_ACTIONS: Record<
  string,
  Record<TTransactionPermissionMode, string>
> = {
  [JOURNALS.MAIN]: {
    read: 'readMainTransactions',
    manage: 'manageMainTransactions',
    remove: 'removeMainTransactions',
  },
  [JOURNALS.CASH]: {
    read: 'readCashTransactions',
    manage: 'manageCashTransactions',
    remove: 'removeCashTransactions',
  },
  [JOURNALS.BANK]: {
    read: 'readBankTransactions',
    manage: 'manageBankTransactions',
    remove: 'removeBankTransactions',
  },
  [JOURNALS.RECEIVABLE]: {
    read: 'readReceivableTransactions',
    manage: 'manageReceivableTransactions',
    remove: 'removeReceivableTransactions',
  },
  [JOURNALS.PAYABLE]: {
    read: 'readPayableTransactions',
    manage: 'managePayableTransactions',
    remove: 'removePayableTransactions',
  },
  [JOURNALS.TAX]: {
    read: 'readTaxTransactions',
    manage: 'manageTaxTransactions',
    remove: 'removeTaxTransactions',
  },
  [JOURNALS.INV_FB]: {
    read: 'readInventoryOpeningTransactions',
    manage: 'manageInventoryOpeningTransactions',
    remove: 'removeInventoryOpeningTransactions',
  },
  [JOURNALS.INV_INCOME]: {
    read: 'readInvIncomeTransactions',
    manage: 'manageInvIncomeTransactions',
    remove: 'removeInvIncomeTransactions',
  },
  [JOURNALS.INV_OUT]: {
    read: 'readInvOutTransactions',
    manage: 'manageInvOutTransactions',
    remove: 'removeInvOutTransactions',
  },
  [JOURNALS.INV_MOVE]: {
    read: 'readInvMoveTransactions',
    manage: 'manageInvMoveTransactions',
    remove: 'removeInvMoveTransactions',
  },
  [JOURNALS.INV_SALE]: {
    read: 'readInvSaleTransactions',
    manage: 'manageInvSaleTransactions',
    remove: 'removeInvSaleTransactions',
  },
  [JOURNALS.INV_SALE_RETURN]: {
    read: 'readInvSaleReturnTransactions',
    manage: 'manageInvSaleReturnTransactions',
    remove: 'removeInvSaleReturnTransactions',
  },
  [JOURNALS.FXA_INCOME]: {
    read: 'readFxaIncomeTransactions',
    manage: 'manageFxaIncomeTransactions',
    remove: 'removeFxaIncomeTransactions',
  },
  [JOURNALS.FXA_OUT]: {
    read: 'readFxaOutTransactions',
    manage: 'manageFxaOutTransactions',
    remove: 'removeFxaOutTransactions',
  },
  [JOURNALS.FXA_MOVE]: {
    read: 'readFxaMoveTransactions',
    manage: 'manageFxaMoveTransactions',
    remove: 'removeFxaMoveTransactions',
  },
  [JOURNALS.FXA_SALE]: {
    read: 'readFxaSaleTransactions',
    manage: 'manageFxaSaleTransactions',
    remove: 'removeFxaSaleTransactions',
  },
};

const FOLLOW_JOURNALS_BY_SOURCE: Record<string, string[]> = {
  [JOURNALS.CASH]: [JOURNALS.EXCHANGE_DIFF],
  [JOURNALS.BANK]: [JOURNALS.EXCHANGE_DIFF],
  [JOURNALS.RECEIVABLE]: [JOURNALS.EXCHANGE_DIFF],
  [JOURNALS.PAYABLE]: [JOURNALS.EXCHANGE_DIFF],
  [JOURNALS.INV_MOVE]: [JOURNALS.INV_MOVE_IN],
  [JOURNALS.INV_SALE]: [JOURNALS.INV_SALE_OUT, JOURNALS.INV_SALE_COST],
  [JOURNALS.INV_SALE_RETURN]: [
    JOURNALS.INV_SALE_RETURN_OUT,
    JOURNALS.INV_SALE_RETURN_COST,
  ],
  [JOURNALS.FXA_OUT]: [
    JOURNALS.FXA_OUT_COST,
    JOURNALS.FXA_OUT_DEPRECIATION,
    JOURNALS.FXA_OUT_LOSS,
  ],
  [JOURNALS.FXA_MOVE]: [JOURNALS.FXA_MOVE_IN],
  [JOURNALS.FXA_SALE]: [
    JOURNALS.FXA_OUT_COST,
    JOURNALS.FXA_OUT_DEPRECIATION,
    JOURNALS.FXA_OUT_LOSS,
  ],
};

const getUniqueValues = (values: string[]) => [...new Set(values)];

const canUseAction = async (
  { checkPermission, user }: TPermissionContext,
  action: string,
) => {
  if (user?.isOwner) {
    return true;
  }

  try {
    await checkPermission(action);
    return true;
  } catch {
    return false;
  }
};

export const getTransactionJournalPermissionAction = (
  journal: string,
  mode: TTransactionPermissionMode,
) => TRANSACTION_PERMISSION_ACTIONS[journal]?.[mode];

export const getPermittedTransactionJournals = async (
  context: TPermissionContext,
  mode: TTransactionPermissionMode,
) => {
  if (context.user?.isOwner) {
    return getUniqueValues([
      ...Object.keys(TRANSACTION_PERMISSION_ACTIONS),
      ...Object.values(FOLLOW_JOURNALS_BY_SOURCE).flat(),
    ]);
  }

  const permittedSourceJournals: string[] = [];

  for (const [journal, actions] of Object.entries(
    TRANSACTION_PERMISSION_ACTIONS,
  )) {
    if (await canUseAction(context, actions[mode])) {
      permittedSourceJournals.push(journal);
    }
  }

  return getUniqueValues([
    ...permittedSourceJournals,
    ...permittedSourceJournals.flatMap(
      (journal) => FOLLOW_JOURNALS_BY_SOURCE[journal] || [],
    ),
  ]);
};

export const assertTransactionJournalPermission = async (
  context: TPermissionContext,
  journal: string,
  mode: TTransactionPermissionMode,
) => {
  const action = getTransactionJournalPermissionAction(journal, mode);

  if (context.user?.isOwner) {
    return;
  }

  if (action) {
    await context.checkPermission(action);
    return;
  }

  const permittedJournals = await getPermittedTransactionJournals(
    context,
    mode,
  );

  if (!permittedJournals.includes(journal)) {
    throw new Error('Permission denied');
  }
};

export const assertTransactionJournalsPermission = async (
  context: TPermissionContext,
  journals: string[],
  mode: TTransactionPermissionMode,
) => {
  for (const journal of getUniqueValues(journals.filter(Boolean))) {
    await assertTransactionJournalPermission(context, journal, mode);
  }
};

export const applyTransactionJournalPermissionFilter = (
  filter: Record<string, unknown>,
  permittedJournals: string[],
) => {
  if (!permittedJournals.length) {
    filter.journal = { $in: [] };
    return;
  }

  const currentJournalFilter = filter.journal as
    | string
    | { $in?: string[] }
    | undefined;

  if (typeof currentJournalFilter === 'string') {
    filter.journal = permittedJournals.includes(currentJournalFilter)
      ? currentJournalFilter
      : { $in: [] };
    return;
  }

  if (Array.isArray(currentJournalFilter?.$in)) {
    filter.journal = {
      $in: currentJournalFilter.$in.filter((journal) =>
        permittedJournals.includes(journal),
      ),
    };
    return;
  }

  filter.journal = { $in: permittedJournals };
};
