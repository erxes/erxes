import { ILoyaltyAccountTypeDocument } from '@/score/@types/accountType';
import { IScoreCampaignDocument } from '@/score/@types/scoreCampaign';
import { IContext } from '~/connectionResolvers';

export const LoyaltyAccountType = {
  // Account types created before tiers have no `tiers` in lean reads.
  tiers({ tiers }: ILoyaltyAccountTypeDocument) {
    return tiers || [];
  },

  async campaignCount(
    { _id }: ILoyaltyAccountTypeDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.ScoreCampaigns.countDocuments({ accountTypeId: _id });
  },
};

export const ScoreCampaign = {
  async accountType(
    { accountTypeId }: IScoreCampaignDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return accountTypeId
      ? models.LoyaltyAccountTypes.findOne({ _id: accountTypeId }).lean()
      : null;
  },
};
