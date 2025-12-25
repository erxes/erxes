import { IContext } from '~/connectionResolvers';
import { ICampaignDocument } from '~/modules/campaign/@types';

export default {
  async __resolveReference(
    { _id }: ICampaignDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.Campaign.findOne({ _id }).lean();
  },

  async createdBy({ createdBy }: ICampaignDocument) {
    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: ICampaignDocument) {
    return { __typename: 'User', _id: updatedBy };
  },
};
