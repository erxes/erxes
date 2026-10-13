import {
  ILoyaltyAccountDocument,
  ILoyaltyAccountParams,
  TLoyaltyAccountOwnerType,
} from '@/score/@types/account';
import { escapeRegExp, sendTRPCMessage } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';

// Owners matched by name are capped; a broader search should narrow the text.
const OWNER_SEARCH_LIMIT = 200;
const ACCOUNT_NUMBER = /^\d{10}$/;
const NO_TIER = 'none';

const OWNER_LOOKUPS: Record<
  TLoyaltyAccountOwnerType,
  { module: string; action: string; fields: string[] }
> = {
  customer: {
    module: 'customers',
    action: 'findActiveCustomers',
    fields: ['firstName', 'lastName', 'primaryEmail', 'primaryPhone', 'code'],
  },
  company: {
    module: 'companies',
    action: 'findActiveCompanies',
    fields: ['primaryName', 'primaryEmail', 'primaryPhone', 'code'],
  },
  user: {
    module: 'users',
    action: 'find',
    fields: ['details.fullName', 'email', 'username', 'code'],
  },
};

// Owners live in core, so a name search first asks core which ids match.
const findOwnerIds = async (
  subdomain: string,
  ownerType: TLoyaltyAccountOwnerType,
  searchValue: string,
): Promise<string[]> => {
  const { module, action, fields } = OWNER_LOOKUPS[ownerType];
  const pattern = new RegExp(escapeRegExp(searchValue), 'i');
  const query = { $or: fields.map((field) => ({ [field]: pattern })) };

  const owners: { _id: string }[] = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module,
    action,
    input:
      action === 'find'
        ? { query, fields: { _id: 1 } }
        : { query, fields: { _id: 1 }, limit: OWNER_SEARCH_LIMIT },
    defaultValue: [],
  });

  return owners.slice(0, OWNER_SEARCH_LIMIT).map(({ _id }) => _id);
};

export const buildAccountFilter = async (
  subdomain: string,
  params: ILoyaltyAccountParams,
): Promise<FilterQuery<ILoyaltyAccountDocument>> => {
  const filter: FilterQuery<ILoyaltyAccountDocument> = {};

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.accountTypeId) {
    const path = `balances.${params.accountTypeId}`;

    if (!params.tier) {
      filter[path] = { $exists: true };
    } else if (params.tier === NO_TIER) {
      filter[path] = { $exists: true };
      filter[`${path}.tier`] = { $in: [null, ''] };
    } else {
      filter[`${path}.tier`] = params.tier;
    }
  }

  const searchValue = params.searchValue?.trim();

  if (searchValue) {
    if (ACCOUNT_NUMBER.test(searchValue)) {
      filter.number = searchValue;
    } else {
      const ownerTypes: TLoyaltyAccountOwnerType[] = params.ownerType
        ? [params.ownerType]
        : ['customer', 'company', 'user'];
      const matches = await Promise.all(
        ownerTypes.map(async (ownerType) => ({
          ownerType,
          ownerId: {
            $in: await findOwnerIds(subdomain, ownerType, searchValue),
          },
        })),
      );

      filter.$or = matches.filter(({ ownerId }) => ownerId.$in.length);

      if (!filter.$or.length) {
        // Nobody matched: an empty $or would be rejected by Mongo.
        filter._id = { $in: [] };
        delete filter.$or;
      }
    }
  }

  return filter;
};
