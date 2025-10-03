import { IChannelDocument } from '@/inbox/@types/channels';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export default {
  async integrations(channel: IChannelDocument, _args, { models }: IContext) {
    return models.Integrations.findIntegrations({
      _id: { $in: channel.integrationIds },
    });
  },

  async members(channel: IChannelDocument) {
    try {
      return await sendTRPCMessage({
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'find',
        input: {
          query: {
            _id: { $in: channel.memberIds },
            isActive: { $ne: false },
          },
        },
        defaultValue: [],
      });
    } catch (error) {
      console.error('Failed to fetch channel members:', error);
      return [];
    }
  },
};
