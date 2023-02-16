// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage,
  sendKbMessage
} from '../../../messageBroker';

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

  async clientPortalTickets(_root, _args, { subdomain, cpUser }: IContext) {
    if (!cpUser) {
      throw new Error('Login required');
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: cpUser.erxesCustomerId
      },
      isRPC: true
    });

    if (!customer) {
      return [];
    }

    const conformities = await sendCoreMessage({
      subdomain,
      action: 'conformities.getConformities',
      data: {
        mainType: 'customer',
        mainTypeIds: [customer._id],
        relTypes: ['ticket']
      },
      isRPC: true,
      defaultValue: []
    });

    if (conformities.length === 0) {
      return [];
    }

    const ticketIds: string[] = [];

    for (const c of conformities) {
      if (c.relType === 'ticket' && c.mainType === 'customer') {
        ticketIds.push(c.relTypeId);
      }

      if (c.mainType === 'ticket' && c.relType === 'customer') {
        ticketIds.push(c.mainTypeId);
      }
    }

    return sendCardsMessage({
      subdomain,
      action: 'tickets.find',
      data: {
        _id: { $in: ticketIds }
      },
      isRPC: true
    });
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
      searchValue
    }: {
      searchValue?: string;
      categoryIds: string[];
    },
    { subdomain }: IContext
  ) {
    const selector: any = {};

    if (searchValue && searchValue.trim()) {
      selector.$or = [
        { title: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
        { content: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
        { summary: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } }
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
  }
};

export default configClientPortalQueries;
