import { IContext } from '../../connectionResolver';
import { sendTagsMessage } from '../../messageBroker';
import { IRiskIndicatorsDocument } from '../../models/definitions/indicator';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.RiskIndicators.findOne({ _id });
  },

  async tags(indicator: IRiskIndicatorsDocument, {}, { subdomain }: IContext) {
    return sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        _id: { $in: indicator.tagIds }
      },
      isRPC: true,
      defaultValue: []
    });
  }
};
