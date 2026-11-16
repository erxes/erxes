import {
  TAutomationFindObjectResult,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { getOwnerSummary } from '~/utils/ownerSummary';
import { LOYALTY_ACCOUNT_FIND_OBJECT_TYPE } from './constants';

type TFindObjectData =
  TAutomationProducersInput[TAutomationProducers.FIND_OBJECT];

const generateAccountFilter = (field: string, value: string) => {
  if (field === '_id') {
    return { _id: value };
  }

  if (field === 'number') {
    return { number: value };
  }

  // A customer's account only: companies and team members hold their own
  if (field === 'ownerId') {
    return { ownerType: 'customer', ownerId: value };
  }

  return null;
};

type TOwnerSummary = Awaited<ReturnType<typeof getOwnerSummary>>;

// Balances by wallet name and the vouchers the customer can use, the way a
// person would read them, not the stored map of account type ids.
export const toLoyaltyAccountObject = (
  account: { _id: string; number: string; status?: string; ownerId: string },
  summary: TOwnerSummary,
) => ({
  _id: account._id,
  number: account.number,
  status: account.status || 'active',
  ownerId: account.ownerId,
  wallets: summary.wallets.map(
    ({ name, balance, pending, tier, expiringSoon }) => ({
      name,
      balance,
      pending,
      tier: tier?.name ?? null,
      expiringSoon,
    }),
  ),
  vouchers: summary.vouchers.map(
    ({ title, kind, value, expiresAt, status }) => ({
      title,
      kind,
      value,
      expiresAt,
      status,
    }),
  ),
});

export const findLoyaltyObject = async (
  models: IModels,
  subdomain: string,
  data: TFindObjectData,
): Promise<TAutomationFindObjectResult> => {
  const { objectType, field, value } = data;

  if (objectType !== LOYALTY_ACCOUNT_FIND_OBJECT_TYPE) {
    throw new Error(`Unsupported loyalty find object type: ${objectType}`);
  }

  const filter = generateAccountFilter(field, value);

  if (!filter) {
    throw new Error(
      `Unsupported lookup field "${field}" for "Loyalty account"`,
    );
  }

  const account = await models.LoyaltyAccounts.findOne(filter).lean();
  const object = account
    ? toLoyaltyAccountObject(
        account,
        await getOwnerSummary(models, subdomain, {
          ownerType: account.ownerType,
          ownerId: account.ownerId,
        }),
      )
    : null;

  return {
    found: !!object,
    objectType,
    objectId: object?._id,
    object,
    matchedBy: { field, value },
  };
};
