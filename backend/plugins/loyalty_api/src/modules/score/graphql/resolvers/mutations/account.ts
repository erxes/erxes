import { setAccountTier } from '@/score/services/accountTier';
import { IContext } from '~/connectionResolvers';

export const loyaltyAccountMutations = {
  async loyaltyAccountFreeze(
    _root: undefined,
    { _id, reason }: { _id: string; reason: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyAccountFreeze');

    return models.LoyaltyAccounts.setFrozen({
      accountId: _id,
      frozen: true,
      reason,
      userId: user?._id,
    });
  },

  async loyaltyAccountUnfreeze(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyAccountFreeze');

    return models.LoyaltyAccounts.setFrozen({
      accountId: _id,
      frozen: false,
      userId: user?._id,
    });
  },

  async loyaltyAccountSetTier(
    _root: undefined,
    {
      _id,
      accountTypeId,
      tier,
    }: { _id: string; accountTypeId: string; tier?: string | null },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyAccountSetTier');

    const { account } = await setAccountTier({
      models,
      subdomain,
      accountId: _id,
      accountTypeId,
      tier: tier || null,
      via: { createdBy: user?._id },
    });

    return account;
  },
};
