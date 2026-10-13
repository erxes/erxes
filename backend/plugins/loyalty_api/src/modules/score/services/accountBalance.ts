import { ILoyaltyAccountTypeDocument } from '@/score/@types/accountType';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const BALANCE_KEY = 'balance';
const TIER_KEY = 'tier';
const LOYALTY_GROUP = { key: 'loyalty', name: 'Loyalty' };

type TAccountRef = Pick<
  ILoyaltyAccountTypeDocument,
  '_id' | 'name' | 'ownerType'
>;

type TAccountFieldsRef = TAccountRef &
  Partial<Pick<ILoyaltyAccountTypeDocument, 'tiers' | 'tierFieldId'>>;

export const accountTypeFieldOwner = (accountTypeId: string) => ({
  plugin: 'loyalty',
  module: 'accountType',
  refId: accountTypeId,
});

// cpUser balances live on the customer the portal user is linked to.
export const accountContentType = (ownerType: string) =>
  ownerType === 'cpUser' ? 'core:customer' : `core:${ownerType}`;

const balanceFieldDefinition = (accountType: TAccountRef) => ({
  key: BALANCE_KEY,
  name: accountType.name,
  type: 'number' as const,
  index: {},
});

const callFields = <T>(subdomain: string, action: string, input: unknown) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'fields',
    action,
    input,
    // A balance that silently failed to land is worse than a failed write.
    throwOnError: true,
  }) as Promise<T>;

// Once an account type has had tiers its tier field stays declared, so
// removed tiers become deprecated options instead of vanishing.
const tierFieldDefinition = (accountType: TAccountFieldsRef) => ({
  key: TIER_KEY,
  name: `${accountType.name} tier`,
  type: 'select' as const,
  options: (accountType.tiers || [])
    .filter(({ deprecated }) => !deprecated)
    .sort((a, b) => a.order - b.order)
    .map(({ key, name }) => ({ value: key, label: name })),
  index: {},
});

export const ensureAccountFields = async (
  subdomain: string,
  accountType: TAccountFieldsRef,
) => {
  const withTier = !!(accountType.tiers?.length || accountType.tierFieldId);
  const fields = await callFields<{ _id: string; owner?: { key?: string } }[]>(
    subdomain,
    'ensureFeatured',
    {
      owner: accountTypeFieldOwner(accountType._id),
      contentType: accountContentType(accountType.ownerType),
      group: LOYALTY_GROUP,
      fields: [
        balanceFieldDefinition(accountType),
        ...(withTier ? [tierFieldDefinition(accountType)] : []),
      ],
    },
  );

  const fieldId = fields.find(({ owner }) => owner?.key === BALANCE_KEY)?._id;
  const tierFieldId = fields.find(({ owner }) => owner?.key === TIER_KEY)?._id;

  if (!fieldId || (withTier && !tierFieldId)) {
    throw new Error(`Could not create the fields of ${accountType.name}`);
  }

  return { fieldId, tierFieldId };
};

export const adoptAccountBalanceField = async (
  subdomain: string,
  accountType: TAccountRef,
  fieldId: string,
) =>
  callFields<{ recast: number; unreadable: number }>(
    subdomain,
    'adoptFeatured',
    {
      fieldId,
      owner: accountTypeFieldOwner(accountType._id),
      group: LOYALTY_GROUP,
      field: balanceFieldDefinition(accountType),
    },
  );

export const setAccountBalanceFieldArchived = (
  subdomain: string,
  accountTypeId: string,
  archived: boolean,
) =>
  callFields<number>(subdomain, 'setFeaturedArchived', {
    owner: accountTypeFieldOwner(accountTypeId),
    archived,
  });

type TAccountValueTarget = {
  accountTypeId: string;
  ownerType: string;
  recordId: string;
};

const writeAccountValue = (
  subdomain: string,
  { accountTypeId, ownerType, recordId }: TAccountValueTarget,
  key: string,
  value: unknown,
) =>
  callFields<number>(subdomain, 'setFeaturedValues', {
    owner: accountTypeFieldOwner(accountTypeId),
    contentType: accountContentType(ownerType),
    records: [{ _id: recordId, values: { [key]: value } }],
  });

export const writeAccountBalance = (
  subdomain: string,
  { balance, ...target }: TAccountValueTarget & { balance: number },
) => writeAccountValue(subdomain, target, BALANCE_KEY, balance);

// A null tier clears the value on the owner record.
export const writeAccountTier = (
  subdomain: string,
  { tier, ...target }: TAccountValueTarget & { tier: string | null },
) => writeAccountValue(subdomain, target, TIER_KEY, tier);
