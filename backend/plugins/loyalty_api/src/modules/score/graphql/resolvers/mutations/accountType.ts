import { ILoyaltyAccountType } from '@/score/@types/accountType';
import { IContext } from '~/connectionResolvers';

export const loyaltyAccountTypeMutations = {
  async loyaltyAccountTypeAdd(
    _root: undefined,
    doc: ILoyaltyAccountType,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignCreate');

    return models.LoyaltyAccountTypes.createAccountType(doc, user);
  },

  async loyaltyAccountTypeEdit(
    _root: undefined,
    {
      _id,
      name,
      frozenBlocks,
      tiers,
      reset,
      expiry,
      pendingDays,
      currencyRatio,
      pointValue,
      earnEligibility,
    }: { _id: string } & Pick<
      ILoyaltyAccountType,
      | 'name'
      | 'frozenBlocks'
      | 'tiers'
      | 'reset'
      | 'expiry'
      | 'pendingDays'
      | 'currencyRatio'
      | 'pointValue'
      | 'earnEligibility'
    >,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');

    return models.LoyaltyAccountTypes.updateAccountType(_id, {
      name,
      frozenBlocks,
      tiers,
      reset,
      expiry,
      pendingDays,
      currencyRatio,
      pointValue,
      earnEligibility,
    });
  },

  async loyaltyAccountTypeArchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');

    return models.LoyaltyAccountTypes.setAccountTypeArchived(_id, true);
  },

  async loyaltyAccountTypeUnarchive(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');

    return models.LoyaltyAccountTypes.setAccountTypeArchived(_id, false);
  },

  async loyaltyAccountTypesAdoptCampaignFields(
    _root: undefined,
    _args: undefined,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('loyaltyCampaignUpdate');

    return models.LoyaltyAccountTypes.adoptCampaignFields(user);
  },
};
