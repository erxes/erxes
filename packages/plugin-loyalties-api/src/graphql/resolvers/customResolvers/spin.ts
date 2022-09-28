import { IContext } from '../../../connectionResolver';
import { ISpinDocument } from '../../../models/definitions/spins';
import { getOwner } from '../../../models/utils';

export default {
  async owner(spin: ISpinDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, spin.ownerType, spin.ownerId);
  },
  async campaign(spin: ISpinDocument, _args, { models }: IContext) {
    return models.SpinCampaigns.findOne({ _id: spin.campaignId }).lean();
  }
};
