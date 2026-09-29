import { TLoyaltyAccountTypeStatus } from '@/score/@types/accountType';
import { IContext } from '~/connectionResolvers';

export const loyaltyAccountTypeQueries = {
  async loyaltyAccountTypes(
    _root: undefined,
    {
      status,
      ownerType,
    }: { status?: TLoyaltyAccountTypeStatus; ownerType?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');

    return models.LoyaltyAccountTypes.find({
      ...(status ? { status } : {}),
      ...(ownerType ? { ownerType } : {}),
    })
      .sort({ createdAt: 1 })
      .lean();
  },

  async loyaltyAccountType(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');

    return models.LoyaltyAccountTypes.getAccountType(_id);
  },

  // Campaigns still writing to a plain custom field, waiting for adoption.
  async loyaltyAccountTypeLegacyFieldCount(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignView');

    const fieldIds = await models.ScoreCampaigns.distinct('fieldId', {
      fieldId: { $nin: [null, ''] },
      accountTypeId: { $in: [null, ''] },
    });

    return fieldIds.length;
  },
};
