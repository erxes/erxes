import { ISpinDocument } from '~/modules/spin/@types/spin';
import { getLoyaltyOwner } from '~/utils/getOwner';
import { IContext } from '~/connectionResolvers';

export default {
  async owner(spin: ISpinDocument, _args: unknown, { subdomain }: IContext) {
    return getLoyaltyOwner(subdomain, {
      ownerType: spin.ownerType,
      ownerId: spin.ownerId,
    });
  },

  async campaign(
    spin: ISpinDocument,
    _args: unknown,
    { models }: IContext,
  ) {
    return models.SpinCampaign.findOne({ _id: spin.campaignId }).lean();
  },
};
