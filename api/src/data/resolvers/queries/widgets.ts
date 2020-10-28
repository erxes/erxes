import * as momentTz from 'moment-timezone';
import {
  ConversationMessages,
  Conversations,
  Integrations,
  KnowledgeBaseArticles as KnowledgeBaseArticlesModel,
  KnowledgeBaseCategories as KnowledgeBaseCategoriesModel,
  KnowledgeBaseTopics,
  KnowledgeBaseTopics as KnowledgeBaseTopicsModel,
  Users
} from '../../../db/models';
import Messages from '../../../db/models/ConversationMessages';
import { IIntegrationDocument } from '../../../db/models/definitions/integrations';
import { registerOnboardHistory } from '../../utils';

export const isMessengerOnline = async (integration: IIntegrationDocument) => {
  if (!integration.messengerData) {
    return false;
  }

  const {
    availabilityMethod,
    isOnline,
    onlineHours,
    timezone
  } = integration.messengerData;

  const modifiedIntegration = {
    ...integration.toJSON(),
    messengerData: {
      availabilityMethod,
      isOnline,
      onlineHours,
      timezone
    }
  };

  return Integrations.isOnline(modifiedIntegration);
};

const messengerSupporters = async (integration: IIntegrationDocument) => {
  const messengerData = integration.messengerData || { supporterIds: [] };

  return Users.find({ _id: { $in: messengerData.supporterIds } });
};

const getWidgetMessages = (conversationId: string) => {
  return ConversationMessages.find({
    conversationId,
    internal: false,
    fromBot: { $exists: false }
  }).sort({
    createdAt: 1
  });
};

export default {
  /*
   * Search published articles that contain searchString (case insensitive)
   * in a topic found by topicId
   * @return {Promise} searched articles
   */
  async widgetsKnowledgeBaseArticles(
    _root: any,
    args: { topicId: string; searchString: string }
  ) {
    const { topicId, searchString = '' } = args;

    let articleIds: string[] = [];

    const topic = await KnowledgeBaseTopicsModel.findOne({ _id: topicId });

    if (!topic) {
      return [];
    }

    const categories = await KnowledgeBaseCategoriesModel.find({
      _id: topic.categoryIds
    });

    categories.forEach(category => {
      articleIds = [...articleIds, ...(category.articleIds || [])];
    });

    return KnowledgeBaseArticlesModel.find({
      _id: { $in: articleIds },
      content: { $regex: `.*${searchString.trim()}.*`, $options: 'i' },
      status: 'publish'
    });
  },

  widgetsGetMessengerIntegration(_root, args: { brandCode: string }) {
    return Integrations.getWidgetIntegration(args.brandCode, 'messenger');
  },

  widgetsConversations(
    _root,
    args: { integrationId: string; customerId: string }
  ) {
    const { integrationId, customerId } = args;

    return Conversations.find({
      integrationId,
      customerId
    }).sort({ createdAt: -1 });
  },

  async widgetsConversationDetail(
    _root,
    args: { _id: string; integrationId: string }
  ) {
    const { _id, integrationId } = args;

    const conversation = await Conversations.findOne({ _id, integrationId });
    const integration = await Integrations.findOne({ _id: integrationId });

    // When no one writes a message
    if (!conversation && integration) {
      return {
        messages: [],
        isOnline: await isMessengerOnline(integration)
      };
    }

    if (!conversation || !integration) {
      return null;
    }

    return {
      _id,
      messages: await getWidgetMessages(conversation._id),
      isOnline: await isMessengerOnline(integration),
      operatorStatus: conversation.operatorStatus,
      participatedUsers: await Users.find({
        _id: { $in: conversation.participatedUserIds }
      }),
      supporters: await messengerSupporters(integration)
    };
  },

  widgetsMessages(_root, args: { conversationId: string }) {
    const { conversationId } = args;

    return getWidgetMessages(conversationId);
  },

  widgetsUnreadCount(_root, args: { conversationId: string }) {
    const { conversationId } = args;

    return Messages.widgetsGetUnreadMessagesCount(conversationId);
  },

  async widgetsTotalUnreadCount(
    _root,
    args: { integrationId: string; customerId: string }
  ) {
    const { integrationId, customerId } = args;

    // find conversations
    const convs = await Conversations.find({ integrationId, customerId });

    // find read messages count
    return Messages.countDocuments(
      Conversations.widgetsUnreadMessagesQuery(convs)
    );
  },

  async widgetsMessengerSupporters(
    _root,
    { integrationId }: { integrationId: string }
  ) {
    const integration = await Integrations.findOne({ _id: integrationId });
    let timezone = '';

    if (!integration) {
      return {
        supporters: [],
        isOnline: false,
        serverTime: momentTz().tz()
      };
    }

    const messengerData = integration.messengerData || { supporterIds: [] };

    if (integration.messengerData && integration.messengerData.timezone) {
      timezone = integration.messengerData.timezone;
    }

    return {
      supporters: await Users.find({
        _id: { $in: messengerData.supporterIds || [] }
      }),
      isOnline: await isMessengerOnline(integration),
      serverTime: momentTz().tz(timezone)
    };
  },

  /**
   * Topic detail
   */
  async widgetsKnowledgeBaseTopicDetail(_root, { _id }: { _id: string }) {
    const topic = await KnowledgeBaseTopics.findOne({ _id });

    if (topic && topic.createdBy) {
      const user = await Users.getUser(topic.createdBy);

      registerOnboardHistory({ type: 'knowledgeBaseInstalled', user });
    }

    return topic;
  }
};
