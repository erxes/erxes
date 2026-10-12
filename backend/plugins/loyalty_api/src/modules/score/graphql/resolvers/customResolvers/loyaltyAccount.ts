import { ILoyaltyAccountDocument } from '@/score/@types/account';
import { resolveAccountBalances } from '@/score/services/accountBalances';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export const LoyaltyAccount = {
  async owner(
    { ownerType, ownerId }: ILoyaltyAccountDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, { ownerType, ownerId });
  },

  balances(
    account: ILoyaltyAccountDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return resolveAccountBalances(models, account);
  },
};
