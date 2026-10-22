import { sendTRPCMessage } from 'erxes-api-shared/utils';
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
 * Who a deal's transactions are for: its company, else its
 * customer. Read from the deal once it keeps its contact, else (deal not
 * migrated yet) asked of core relations as before.
 */
export const getDealOwner = async (
  subdomain: string,
  deal: { _id: string; customerId?: string | null; companyId?: string | null },
): Promise<TDealOwner> => {
  // Same rule as erxes-api-shared `hasContactFields`: both fields set means
  // the deal keeps its contacts itself.
  if (deal.customerId !== undefined && deal.companyId !== undefined) {
    return deal.companyId
      ? { customerType: 'company', customerId: deal.companyId }
      : { customerType: 'customer', customerId: deal.customerId ?? undefined };
  }

  const relatedIds = (relatedContentType: string): Promise<string[]> =>
    sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'relation',
      action: 'getRelationIds',
      input: {
        contentType: 'sales:deal',
        contentId: deal._id,
        relatedContentType,
      },
      defaultValue: [],
    });

  const companyIds = await relatedIds('core:company');

  if (companyIds?.length) {
    return { customerType: 'company', customerId: companyIds[0] };
  }

  const customerIds = await relatedIds('core:customer');

  return { customerType: 'customer', customerId: customerIds?.[0] };
};
