import { IContext } from '../../connectionResolver';
import { sendTagsMessage } from '../../messageBroker';
import { IIndicatorsGroupsDocument } from '../../models/definitions/indicator';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.IndicatorsGroups.findOne({ _id });
  },
  async tags(
    indicator: IIndicatorsGroupsDocument,
    {},
    { subdomain }: IContext
  ) {
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
