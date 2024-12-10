// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';

import { IContext, IModels } from '../../../connectionResolver';
import {
  sendCommonMessage,
  sendKbMessage,
  sendTasksMessage,
  sendTicketsMessage,
} from '../../../messageBroker';
import { getCards, getUserCards } from '../../../utils';

const getByHost = async (models: IModels, requestInfo, clientPortalName?) => {
  const origin = requestInfo.headers.origin;
  const pattern = `.*${origin}.*`;

  let config = await models.ClientPortals.findOne({ url: { $regex: pattern } });

  if (clientPortalName) {
    config = await models.ClientPortals.findOne({
      name: clientPortalName,
    });
  }

  if (!config) {
    throw new Error('Not found');
  }

  return config;
};

const configClientPortalQueries = {
  async clientPortalGetConfigs(
    _root,
    args: { kind?: string; page?: number; perPage?: number; search?: string },
    { models }: IContext
  ) {
    const { kind, search } = args;

    if (search) {
      const res = await models.ClientPortals.find({
        $or: [
          { name: { $regex: new RegExp(`^${search}$`, 'i') } },
          { domain: { $regex: new RegExp(`^${search}$`, 'i') } },
          { url: { $regex: new RegExp(search, 'i') } },
        ],
      }).lean();
      return res
    }

    const query: any = {};

    if (kind) {
      query.kind = kind;
    }

    return paginate(models.ClientPortals.find(query), args);
  },

  async clientPortalConfigsTotalCount(_root, _args, { models }: IContext) {
    return models.ClientPortals.countDocuments();
  },

  /**
   * Get last config
   */
  async clientPortalGetLast(_root, { kind }, { models }: IContext) {
    return models.ClientPortals.findOne({ kind }).sort({
      createdAt: -1,
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
    { clientPortalName },
    { models, requestInfo }: IContext
  ) {
    return await getByHost(models, requestInfo, clientPortalName);
  },

  async clientPortalGetTaskStages(
    _root,
    _args,
    { models, subdomain, requestInfo }: IContext
  ) {
    const config = await getByHost(models, requestInfo);

    return sendTasksMessage({
      subdomain,
      action: 'stages.find',
      data: {
        pipelineId: config.taskPublicPipelineId,
      },
      isRPC: true,
    });
  },

  async clientPortalGetTasks(
    _root,
    { stageId },
    { models, subdomain, requestInfo }: IContext
  ) {
    const config = await getByHost(models, requestInfo);

    const stage = await sendTasksMessage({
      subdomain,
      action: 'stages.findOne',
      data: {
        _id: stageId,
      },
      isRPC: true,
    });

    if (config.taskPublicPipelineId !== stage.pipelineId) {
      throw new Error('Invalid request');
    }

    return sendTasksMessage({
      subdomain,
      action: 'tasks.find',
      data: {
        stageId,
      },
      isRPC: true,
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
          _id,
        },
      },
      isRPC: true,
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

  async clientPortalTicket(
    _root,
    { _id }: { _id: string },
    { subdomain }: IContext
  ) {
    return sendTicketsMessage({
      subdomain,
      action: 'tickets.findOne',
      data: {
        _id,
      },
      isRPC: true,
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
      topicId,
      isPrivate,
    }: {
      searchValue?: string;
      categoryIds: string[];
      topicId?: string;
      isPrivate: Boolean;
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
            { summary: { $regex: `.*${searchValue.trim()}.*`, $options: 'i' } },
          ],
        },
        { topicId },
      ];
    }

    if (categoryIds && categoryIds.length > 0) {
      selector.categoryId = { $in: categoryIds };
    }

    if (!isPrivate) {
      selector.isPrivate = { $in: [null, false] };
    }

    if (isPrivate) {
      selector.isPrivate = { $in: [null, false, true] };
    }

    return sendKbMessage({
      subdomain,
      action: 'articles.find',
      data: {
        query: {
          ...selector,
          status: { $ne: 'draft' },
        },
        sort: {
          createdDate: -1,
        },
      },
      isRPC: true,
      defaultValue: [],
    });
  },

  async clientPortalGetAllowedFields(
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) {
    const configs = await models.FieldConfigs.find({
      allowedClientPortalIds: _id,
    });

    const required = await models.FieldConfigs.find({
      allowedClientPortalIds: _id,
      requiredOn: _id,
    });

    if (!configs || configs.length === 0) {
      return [];
    }

    const fieldIds = configs.map((config) => config.fieldId);
    const fields = await sendCommonMessage({
      subdomain,
      serviceName: 'core',
      action: "fields.find",
      data: {
        query: {
          _id: { $in: fieldIds },
          contentType: 'clientportal:user',
        },
      },
      isRPC: true,
      defaultValue: [],
    });

    if (!required.length || required.length === 0) {
      return fields;
    }

    return fields.map((field) => {
      const found = required.find((config) => config.fieldId === field._id);

      if (!found) {
        return field;
      }

      return {
        ...field,
        isRequired: true,
      };
    });
  },

  async clientPortalCardUsers(
    _root,
    { contentType, contentTypeId, userKind },
    { models }: IContext
  ) {
    const userIds = await models.ClientPortalUserCards.getUserIds(
      contentType,
      contentTypeId
    );

    if (!userIds || userIds.length === 0) {
      return [];
    }

    const users = await models.ClientPortalUsers.aggregate([
      {
        $match: {
          _id: { $in: userIds },
        },
      },
      {
        $lookup: {
          from: 'client_portals',
          localField: 'clientPortalId',
          foreignField: '_id',
          as: 'clientPortal',
        },
      },
      {
        $unwind: '$clientPortal',
      },
      {
        $match: {
          'clientPortal.kind': userKind,
        },
      },
    ]);

    return users;
  },

  async clientPortalUserTickets(
    _root,
    { userId }: { userId: string },
    { models, cpUser, subdomain }: IContext
  ) {
    const id = userId || (cpUser && cpUser._id);

    if (!id) {
      return [];
    }
    return getUserCards(id, 'ticket', models, subdomain);
  },

  async clientPortalUserDeals(
    _root,
    { userId }: { userId: string },
    { models, cpUser, subdomain }: IContext
  ) {
    const id = userId || (cpUser && cpUser._id);

    if (!id) {
      return [];
    }

    return getUserCards(id, 'deal', models, subdomain);
  },

  async clientPortalUserPurchases(
    _root,
    { userId }: { userId: string },
    { models, cpUser, subdomain }: IContext
  ) {
    const id = userId || (cpUser && cpUser._id);

    if (!id) {
      return [];
    }

    return getUserCards(id, 'purchase', models, subdomain);
  },

  async clientPortalUserTasks(
    _root,
    { userId }: { userId: string },
    { models, cpUser, subdomain }: IContext
  ) {
    const id = userId || (cpUser && cpUser._id);

    if (!id) {
      return [];
    }

    return getUserCards(id, 'task', models, subdomain);
  },

  async clientPortalParticipantDetail(
    _root,
    {
      _id,
      contentType,
      contentTypeId,
      cpUserId,
    }: {
      _id: string;
      contentType: string;
      contentTypeId: string;
      cpUserId: string;
    },
    { models, cpUser, subdomain }: IContext
  ) {
    const filter = {} as any;
    if (_id) filter._id = _id;
    if (contentType) filter.contentType = contentType;
    if (contentTypeId) filter.contentTypeId = contentTypeId;
    if (cpUserId) filter.cpUserId = cpUserId;
    return models.ClientPortalUserCards.findOne(filter);
  },
  async clientPortalParticipants(
    _root,
    {
      contentType,
      contentTypeId,
      userKind,
    }: {
      contentType: string;
      contentTypeId: string;
      userKind: string;
    },
    { models, cpUser, subdomain }: IContext
  ) {
    const userIds = await models.ClientPortalUserCards.getUserIds(
      contentType,
      contentTypeId
    );

    if (!userIds || userIds.length === 0) {
      return [];
    }

    const users = await models.ClientPortalUsers.aggregate([
      {
        $match: {
          _id: { $in: userIds },
        },
      },
      {
        $lookup: {
          from: 'client_portals',
          localField: 'clientPortalId',
          foreignField: '_id',
          as: 'clientPortal',
        },
      },
      {
        $unwind: '$clientPortal',
      },
      {
        $match: {
          'clientPortal.kind': userKind,
        },
      },
    ]);

    const filter = {} as any;

    if (contentType) filter.contentType = contentType;
    if (contentTypeId) filter.contentTypeId = contentTypeId;
    if (users?.length > 0) filter.cpUserId = { $in: users.map((d) => d._id) };
    else return [];
    return models.ClientPortalUserCards.find(filter);
  },
};

export default configClientPortalQueries;
