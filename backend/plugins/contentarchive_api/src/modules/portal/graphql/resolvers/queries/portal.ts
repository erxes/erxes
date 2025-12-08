import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getUserCards } from '@/portal/utils/cards';
import { getConfigByHost } from '@/portal/utils/common';

const queries = {
  async clientPortalGetConfigs(_root, args, { models }: IContext) {
    const { kind, search } = args;

    if (search) {
      const res = await models.Portals.find({
        $or: [
          { name: { $regex: new RegExp(`^${search}$`, 'i') } },
          { domain: { $regex: new RegExp(`^${search}$`, 'i') } },
          { url: { $regex: new RegExp(search, 'i') } },
        ],
      }).lean();
      return res;
    }

    const query: any = {};

    if (kind) {
      query.kind = kind;
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Portals,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  async clientPortalConfigsTotalCount(_root, _args, { models }: IContext) {
    return models.Portals.countDocuments();
  },

  /**
   * Get last config
   */
  async clientPortalGetLast(_root, { kind }, { models }: IContext) {
    return models.Portals.findOne({ kind }).sort({
      createdAt: -1,
    });
  },

  async clientPortalGetConfig(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Portals.findOne({ _id });
  },

  async clientPortalGetConfigByDomain(
    _root,
    { clientPortalName },
    { models, requestInfo }: IContext,
  ) {
    return await getConfigByHost(models, requestInfo, clientPortalName);
  },

  async clientPortalGetTaskStages(
    _root,
    _args,
    { models, requestInfo }: IContext,
  ) {
    const config = await getConfigByHost(models, requestInfo);

    // return sendTasksMessage({
    //   subdomain,
    //   action: 'stages.find',
    //   data: {
    //     pipelineId: config.taskPublicPipelineId,
    //   },
    //   isRPC: true,
    // });

    // TODO: implement after tasks microservice is ready
    return [];
  },

  async clientPortalGetTasks(
    _root,
    { stageId },
    { models, requestInfo }: IContext,
  ) {
    const config = await getConfigByHost(models, requestInfo);

    // const stage = await sendTasksMessage({
    //   subdomain,
    //   action: 'stages.findOne',
    //   data: {
    //     _id: stageId,
    //   },
    //   isRPC: true,
    // });

    // if (config.taskPublicPipelineId !== stage.pipelineId) {
    //   throw new Error('Invalid request');
    // }

    // return sendTasksMessage({
    //   subdomain,
    //   action: 'tasks.find',
    //   data: {
    //     stageId,
    //   },
    //   isRPC: true,
    // });

    // TODO: implement after tasks microservice is ready
    return [];
  },

  async clientPortalKnowledgeBaseTopicDetail(
    _root,
    { _id },
    { models }: IContext,
  ) {
    return models.KnowledgeBaseTopics.findOne({ _id });
  },

  async clientPortalTickets(_root, _args, context: IContext) {
    // return getCards('ticket', context, _args);
  },

  async clientPortalTasks(_root, _args, context: IContext) {
    // return getCards('task', context, _args);
  },

  async clientPortalDeals(_root, _args, context: IContext) {
    // return getCards('deal', context, _args);
  },

  async clientPortalPurchase(_root, _args, context: IContext) {
    // return getCards('purchase', context, _args);
  },

  async clientPortalTicket(_root, { _id }: { _id: string }) {
    // return sendTicketsMessage({
    //   subdomain,
    //   action: 'tickets.findOne',
    //   data: {
    //     _id,
    //   },
    //   isRPC: true,
    // });

    // TODO: implement after tickets microservice is ready
    return null;
  },

  /**
   * knowledgebase article list
   */
  async clientPortalKnowledgeBaseArticles(_root, args, { models }: IContext) {
    const { searchValue, categoryIds, topicId, isPrivate } = args;
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

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.KnowledgeBaseArticles,
      params: args,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async clientPortalGetAllowedFields(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return [];
    // const configs = await models.FieldConfigs.find({
    //   allowedClientPortalIds: _id,
    // });

    // const required = await models.FieldConfigs.find({
    //   allowedClientPortalIds: _id,
    //   requiredOn: _id,
    // });

    // if (!configs || configs.length === 0) {
    //   return [];
    // }

    // const fieldIds = configs.map((config) => config.fieldId);
    // const fields = await sendCommonMessage({
    //   subdomain,
    //   serviceName: 'core',
    //   action: 'fields.find',
    //   data: {
    //     query: {
    //       _id: { $in: fieldIds },
    //       contentType: 'clientportal:user',
    //     },
    //   },
    //   isRPC: true,
    //   defaultValue: [],
    // });

    // if (!required.length || required.length === 0) {
    //   return fields;
    // }

    // return fields.map((field) => {
    //   const found = required.find((config) => config.fieldId === field._id);

    //   if (!found) {
    //     return field;
    //   }

    //   return {
    //     ...field,
    //     isRequired: true,
    //   };
    // });
  },

  async clientPortalCardUsers(
    _root,
    { contentType, contentTypeId, userKind },
    { models }: IContext,
  ) {
    const userIds = await models.UserCards.getUserIds(
      contentType,
      contentTypeId,
    );

    if (!userIds || userIds.length === 0) {
      return [];
    }

    const users = await models.Users.aggregate([
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
    { models, portalUser }: IContext,
  ) {
    const id = userId || (portalUser && portalUser._id);

    if (!id) {
      return [];
    }
    return getUserCards(id, 'ticket', models);
  },

  async clientPortalUserDeals(
    _root,
    { userId }: { userId: string },
    { models, portalUser }: IContext,
  ) {
    const id = userId || (portalUser && portalUser._id);

    if (!id) {
      return [];
    }

    return getUserCards(id, 'deal', models);
  },

  async clientPortalUserPurchases(
    _root,
    { userId }: { userId: string },
    { models, portalUser }: IContext,
  ) {
    const id = userId || (portalUser && portalUser._id);

    if (!id) {
      return [];
    }

    return getUserCards(id, 'purchase', models);
  },

  async clientPortalUserTasks(
    _root,
    { userId }: { userId: string },
    { models, portalUser }: IContext,
  ) {
    const id = userId || (portalUser && portalUser._id);

    if (!id) {
      return [];
    }

    return getUserCards(id, 'task', models);
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
    { models, portalUser }: IContext,
  ) {
    const filter = {} as any;
    if (_id) filter._id = _id;
    if (contentType) filter.contentType = contentType;
    if (contentTypeId) filter.contentTypeId = contentTypeId;
    if (cpUserId) filter.cpUserId = cpUserId;
    return models.UserCards.findOne(filter);
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
    { models, portalUser }: IContext,
  ) {
    const userIds = await models.UserCards.getUserIds(
      contentType,
      contentTypeId,
    );

    if (!userIds || userIds.length === 0) {
      return [];
    }

    const users = await models.Users.aggregate([
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

    if (contentType) {
      filter.contentType = contentType;
    }

    if (contentTypeId) {
      filter.contentTypeId = contentTypeId;
    }
    if (users?.length > 0) {
      filter.cpUserId = { $in: users.map((d) => d._id) };
    } else {
      return [];
    }
    return models.UserCards.find(filter);
  },
};

export default queries;
