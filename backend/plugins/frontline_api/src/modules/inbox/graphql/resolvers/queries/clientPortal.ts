import { markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const cpInboxQueries = {
  async cpIntegrations(
    _root,
    args: { kind?: string; integrationId?: string; channelId?: string },
    { models }: IContext,
  ) {
    const query: any = {};
    if (args.kind) query.kind = args.kind;
    if (args.integrationId) query._id = args.integrationId;
    if (args.channelId) query.channelId = args.channelId;
    return models.Integrations.find(query).lean();
  },

  async cpConversation(
    _root,
    args: {
      customerId?: string;
      integrationId?: string;
      limit?: number;
      skip?: number;
    },
    { models, cpUser }: IContext,
  ) {
    const customerId =
      args.customerId || cpUser?.erxesCustomerId || cpUser?._id;
    const query: any = {};
    if (customerId) query.customerId = customerId;
    if (args.integrationId) query.integrationId = args.integrationId;

    return models.Conversations.find(query)
      .sort({ updatedAt: -1 })
      .skip(args.skip || 0)
      .limit(args.limit || 10);
  },

  async cpConversationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Conversations.findOne({ _id });
  },
};

markResolvers(cpInboxQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
