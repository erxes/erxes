import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  JOURNALS,
  TR_SIDES,
} from '~/modules/accounting/@types/constants';

type TPayConfig =
  | {
      accountId?: string;
    }
  | null
  | undefined;

export const getJournal = async (
  models: IModels,
  payConfig: TPayConfig,
  amount: number,
  isReturn = false,
): Promise<
  | {
      journal: string;
      accountId: string;
      side: string;
      lastAmount: number;
    }
  | undefined
> => {
  const accountId = payConfig?.accountId?.trim();
  if (!accountId) {
    return;
  }

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

type TDealOwner = { customerType: 'company' | 'customer'; customerId?: string };

/**
 * Who a deal's transactions are for: its company, else its customer, both
 * kept on the deal.
 */
export const getDealOwner = (deal: {
  customerId?: string | null;
  companyId?: string | null;
}): TDealOwner =>
  deal.companyId
    ? { customerType: 'company', customerId: deal.companyId }
    : { customerType: 'customer', customerId: deal.customerId ?? undefined };
