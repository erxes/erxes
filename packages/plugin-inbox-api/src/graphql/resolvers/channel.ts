import { IChannelDocument } from '../../models/definitions/channels';
import { getDocumentList } from '../../cacheUtils';
import { IContext } from '../../connectionResolver';

export default {
  integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.findIntegrations({
      _id: { $in: channel.integrationIds }
    });
  },

  members(channel: IChannelDocument, _args, { models, coreModels, subdomain }: IContext) {
    return getDocumentList(models, coreModels, subdomain, 'users', {
      _id: { $in: channel.memberIds },
      isActive: { $ne: false }
    });
  }
};
