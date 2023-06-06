// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import {
  sendCardsMessage,
  sendCommonMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendKbMessage
} from '../../../messageBroker';
import { getCards } from '../../../utils';

const getByHost = async (models, requestInfo) => {
  const origin = requestInfo.headers.origin;
  const pattern = `.*${origin}.*`;

  const config = await models.ClientPortals.findOne({
    url: { $regex: pattern }
  });

  if (!config) {
    throw new Error('Not found');
  }

  return config;
};

const configClientPortalQueries = {
  async clientPortalGetConfigs(
    _root,
    args: { page?: number; perPage?: number },
    { models }: IContext
  ) {
    return paginate(models.ClientPortals.find({}), args);
  },

  async clientPortalConfigsTotalCount(_root, _args, { models }: IContext) {
    return models.ClientPortals.countDocuments();
  },

  /**
   * Get last config
   */
  clientPortalGetLast(_root, _args, { models }: IContext) {
    return models.ClientPortals.findOne({}).sort({
      createdAt: -1
    });
  },

  async clientPortalGetConfig(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ClientPortals.findOne({ _id });
  },

  async clientPortalGetConfigByDomain(
    _root,
    _args,
    { models, requestInfo }: IContext
  ) {
    return getByHost(models, requestInfo);
  },

  async clientPortalGetTaskStages(
    _root,
    _args,
    { models, subdomain, requestInfo }: IContext
  ) {
    const config = await getByHost(models, requestInfo);

    return sendCardsMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: config.taskPublicPipelineId
      },
      isRPC: true
    });
  },

  async clientPortalGetTasks(
    _root,
    { stageId },
    { models, subdomain, requestInfo }: IContext
  ) {
    const config = await getByHost(models, requestInfo);

    const stage = await sendCardsMessage({
      subdomain,
      action: 'stages.findOne',
      data: {
        _id: stageId
      },
      isRPC: true
    });

    if (config.taskPublicPipelineId !== stage.pipelineId) {
      throw new Error('Invalid request');
    }

    return sendCardsMessage({
      subdomain,
      action: 'tasks.find',
      data: {
        stageId
      },
      isRPC: true
    });
  },

  async clientPortalKnowledgeBaseTopicDetail(
    _root,
    { _id },
    { subdomain }: IContext
  ) {
    return sendKbMessage({
      subdomain,
      action: 'topics.findOne',
      data: {
        query: {
          _id
        }
      },
      isRPC: true
    });
  },

  async clientPortalTickets(_root, _args, context: IContext) {
    return getCards('ticket', context, _args);
  },

  async clientPortalTasks(_root, _args, context: IContext) {
    return getCards('task', context, _args);
  },

  async clientPortalDeals(_root, _args, context: IContext) {
    return getCards('deal', context, _args);
  },

  async clientPortalPurchase(_root, _args, context: IContext) {
    return getCards('purchase', context, _args);
  },

  clientPortalTicket(_root, { _id }: { _id: string }, { subdomain }: IContext) {
    return sendCardsMessage({
      subdomain,
      action: 'tickets.findOne',
      data: {
        _id
      },
      isRPC: true
    });
  },

  /**
   * knowledgebase article list
   */
  async clientPortalKnowledgeBaseArticles(
    _root,
    {
      categoryIds,
      searchValue,
      topicId
    }: {
      searchValue?: string;
      categoryIds: string[];
      topicId?: string;
    },
    { subdomain }: IContext
  ) {
    const selector: any = {};

    if (searchValue && searchValue.trim() && topicId && topicId.trim()) {
      selector.$and = [
        {
          $or: [
            { title: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
            { content: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
            { summary: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } }
          ]
        },
        { topicId }
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      selector.categoryId = { $in: categoryIds };
    }

    return sendKbMessage({
      subdomain,
      action: 'articles.find',
      data: {
        query: selector,
        sort: {
          createdDate: -1
        }
      },
      isRPC: true,
      defaultValue: []
    });
  },

  async clientPortalGetAllowedFields(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) {
    const configs = await models.FieldConfigs.find({
      allowedClientPortalIds: _id
    });

    const required = await models.FieldConfigs.find({
      allowedClientPortalIds: _id,
      requiredOn: _id
    });

    if (!configs || configs.length === 0) {
      return [];
    }

    const fieldIds = configs.map(config => config.fieldId);
    const fields = await sendCommonMessage({
      subdomain,
      serviceName: 'forms',
      action: 'fields.find',
      data: {
        query: {
          _id: { $in: fieldIds },
          contentType: 'clientportal:user'
        }
      },
      isRPC: true,
      defaultValue: []
    });

    if (!required.length || required.length === 0) {
      return fields;
    }

    return fields.map(field => {
      const found = required.find(config => config.fieldId === field._id);

      if (!found) {
        return field;
      }

      return {
        ...field,
        isRequired: true
      };
    });
  }
};

export default configClientPortalQueries;
