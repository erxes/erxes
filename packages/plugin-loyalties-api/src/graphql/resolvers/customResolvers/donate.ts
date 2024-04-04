import { IContext } from '../../../connectionResolver';
import { IDonateDocument } from '../../../models/definitions/donates';
import { getOwner } from '../../../models/utils';

export default {
  async owner(donate: IDonateDocument, _args, { subdomain }: IContext) {
    return getOwner(subdomain, donate.ownerType, donate.ownerId);
  },
  async campaign(donate: IDonateDocument, _args, { models }: IContext) {
    return models.DonateCampaigns.findOne({ _id: donate.campaignId }).lean();
  }
};
