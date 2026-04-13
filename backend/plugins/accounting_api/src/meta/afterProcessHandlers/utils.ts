import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  TR_SIDES,
} from '~/modules/accounting/@types/constants';

export const getJournal = async (
  models: IModels,
  payConfig: { accountId: string },
  amount: number,
  isReturn = false,
) => {
  const { accountId } = payConfig;
  const account = await models.Accounts.findOne({ _id: accountId }).lean();

  if (!account) {
    return;
  }

  let journal: string = JOURNALS.MAIN;
  switch (account.journal) {
    case ACCOUNT_JOURNALS.CASH:
      journal = JOURNALS.CASH;
      break;
    case ACCOUNT_JOURNALS.BANK:
      journal = JOURNALS.BANK;
      break;
    case ACCOUNT_JOURNALS.DEBT:
      journal = (amount > 0 && JOURNALS.RECEIVABLE) || JOURNALS.PAYABLE;
      break;
  }

  let side = isReturn ? TR_SIDES.CREDIT : TR_SIDES.DEBIT;
  let lastAmount = amount;

  if (amount < 0) {
    lastAmount = -1 * amount;
    side = isReturn ? TR_SIDES.DEBIT : TR_SIDES.CREDIT;
  }

  return {
    journal,
    accountId,
    side,
    lastAmount,
  };
};
