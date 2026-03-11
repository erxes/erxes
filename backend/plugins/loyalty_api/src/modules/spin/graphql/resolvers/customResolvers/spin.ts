import { ISpinDocument } from '@/spin/@types/spin';
import { IContext } from '~/connectionResolvers';
import { getLoyaltyOwner } from '~/utils/getOwner';

export default {
  async owner(
    { ownerId, ownerType }: ISpinDocument,
    _args: undefined,
    { subdomain }: IContext,
  ) {
    return getLoyaltyOwner(subdomain, {
      ownerType,
      ownerId,
    });
  },
  async campaign(
    { campaignId }: ISpinDocument,
    _args: undefined,
    { models }: IContext,
  ) {
    return models.SpinCampaigns.findOne({ _id: campaignId }).lean();
  },
};
