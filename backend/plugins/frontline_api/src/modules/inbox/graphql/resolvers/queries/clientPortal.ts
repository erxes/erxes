import { markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { widgetQueries } from './widget';

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

  async cpConversations(
    _root,
    args: { integrationId: string; customerId?: string; visitorId?: string },
    context: IContext,
    info,
  ) {
    const customerId =
      args.customerId || context.cpUser?.erxesCustomerId || context.cpUser?._id;

    return widgetQueries.widgetsConversations(
      _root,
      { ...args, customerId },
      context,
      info,
    );
  },

  async cpMessengerConversationDetail(
    _root,
    args: { _id?: string; integrationId: string },
    context: IContext,
    info,
  ) {
    return widgetQueries.widgetsConversationDetail(_root, args, context, info);
  },
};

markResolvers(cpInboxQueries, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
