import {
  ILoyaltyAccountParams,
  TLoyaltyAccountOwnerType,
} from '@/score/@types/account';
import { buildAccountFilter } from '@/score/services/accountList';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const loyaltyAccountQueries = {
  async loyaltyAccounts(
    _root: undefined,
    params: ILoyaltyAccountParams,
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');

    return cursorPaginate({
      model: models.LoyaltyAccounts,
      params: { ...params, orderBy: { joinedAt: -1 } },
      query: await buildAccountFilter(subdomain, params),
      formatter: { joinedAt: 'date' },
    });
  },

  // Null until the owner's first balance write opens the account.
  async loyaltyAccountOfOwner(
    _root: undefined,
    {
      ownerType,
      ownerId,
    }: { ownerType: TLoyaltyAccountOwnerType; ownerId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');

    return models.LoyaltyAccounts.getOwnerAccount({ ownerType, ownerId });
  },

  // Newest first; a tier moves rarely, so a page is the whole story.
  async loyaltyTierLogs(
    _root: undefined,
    params: {
      accountId?: string;
      targetId?: string;
      accountTypeId?: string;
      limit?: number;
    },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('scoreLogView');

    return models.LoyaltyTierLogs.getTierLogs(params);
  },
};
