import { ILoyaltyTierLogDocument } from '@/score/@types/tierLog';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export const LoyaltyTierLog = {
  // Archived wallets still name their old changes. Awaited here: a bare
  // mongoose query is a thenable that runs again when resolved twice.
  async accountType(
    { accountTypeId }: ILoyaltyTierLogDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return await models.LoyaltyAccountTypes.findOne({
      _id: accountTypeId,
    }).lean();
  },

  async owner(
    { ownerType, ownerId }: ILoyaltyTierLogDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, { ownerType, ownerId });
  },
};
