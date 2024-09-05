import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import { sendInboxMessage } from '../../../messageBroker';

import { formSubmissionsQuery } from '../../../formUtils';
import { IFormSubmissionFilter } from '../../../db/models/definitions/forms';
import { getService, getServices } from '@erxes/api-utils/src/serviceDiscovery';
import { paginate } from '@erxes/api-utils/src';

const generateFilterQuery = async (
  { type, brandId, searchValue, tag, status },
  models
) => {
  const query: any = {};

  if (type) {
    query.type = type;
  }

  // filter integrations by channel
  // if (channelId) {
  //   const channel = await models.Channels.getChannel(channelId);
  //   query._id = { $in: channel.integrationIds || [] };
  // }

  if (brandId) {
    query.brandId = brandId;
  }

  if (searchValue) {
    query.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (tag) {
    const object = await models.Tags.findOne({ _id: tag });

    query.tagIds = { $in: [tag, ...(object?.relatedIds || [])] };
  }

  if (status) {
    query.status = status;
  }

  return query;
};

const formQueries = {
  /**
   * Forms list
   */
  async forms(
    _root,
    args: {
      page: number;
      perPage: number;
      type: string;
      searchValue: string;
      brandId: string;
      tag: string;
      status: string;
      sortField: string;
      sortDirection: number;
    },
    { models }: IContext
  ) {
    const qry = {
      ...(await generateFilterQuery(args, models)),
    };

    const sort: any = { createdAt: -1 };

    if (args.sortDirection && args.sortField) {
      sort[args.sortField] = args.sortDirection;
    }

    return paginate(models.Forms.find(qry).sort(sort), args);
  },

  async formsTotalCount(
    _root,
    args,
    { commonQuerySelector, models }: IContext
  ) {
    const counts = {
      total: 0,
      byTag: {},
      byBrand: {},
      byStatus: { active: 0, archived: 0 },
    };

    const qry = {
      ...(await generateFilterQuery(args, models)),
    };

    const count = async (query) => {
      return models.Forms.find(query).countDocuments();
    };

    const tags = await models.Tags.find({ type: `form:${args.type}` }).lean();

    for (const tag of tags) {
      const countQueryResult = await count({ tagIds: tag._id, ...qry });

      counts.byTag[tag._id] = !args.tag
        ? countQueryResult
        : args.tag === tag._id
          ? countQueryResult
          : 0;
    }

    const brands = await models.Brands.find();

    for (const brand of brands) {
      const countQueryResult = await count({ brandId: brand._id, ...qry });

      counts.byBrand[brand._id] = !args.brandId
        ? countQueryResult
        : args.brandId === brand._id
          ? countQueryResult
          : 0;
    }

    counts.byStatus.active = await count({ status: 'active', ...qry });
    counts.byStatus.archived = await count({ status: 'archived', ...qry });

    if (args.status) {
      if (args.status === 'active') {
        counts.byStatus.archived = 0;
      } else {
        counts.byStatus.active = 0;
      }
    }

    counts.total = await count(qry);

    return counts;
  },

  /**
   * Get one form
   */
  async formDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  },

  async formSubmissions(
    _root,
    {
      formId,
      tagId,
      contentTypeIds,
      customerId,
      filters,
      page,
      perPage,
    }: {
      formId: string;
      tagId: string;
      contentTypeIds: string[];
      customerId: string;
      filters: IFormSubmissionFilter[];
      page: number;
      perPage: number;
    },
    { subdomain, models }: IContext
  ) {
    const convsSelector = await formSubmissionsQuery(subdomain, models, {
      formId,
      tagId,
      contentTypeIds,
      customerId,
      filters,
    });

    const conversations = await sendInboxMessage({
      subdomain,
      action: 'getConversationsList',
      data: { query: convsSelector, listParams: { page, perPage } },
      isRPC: true,
      defaultValue: [],
    });

    const result: any[] = [];

    for (const conversation of conversations) {
      const submissions = await models.FormSubmissions.find({
        contentTypeId: conversation._id,
      }).lean();

      conversation.contentTypeId = conversation._id;
      conversation.submissions = submissions;
      result.push(conversation);
    }

    return result;
  },

  async formSubmissionsTotalCount(
    _root,
    {
      formId,
      tagId,
      contentTypeIds,
      customerId,
      filters,
    }: {
      formId: string;
      tagId: string;
      contentTypeIds: string[];
      customerId: string;
      filters: IFormSubmissionFilter[];
    },
    { subdomain, models }: IContext
  ) {
    const convsSelector = await formSubmissionsQuery(subdomain, models, {
      formId,
      tagId,
      contentTypeIds,
      customerId,
      filters,
    });

    return await sendInboxMessage({
      subdomain,
      action: 'conversations.count',
      data: { query: convsSelector },
      isRPC: true,
      defaultValue: [],
    });
  },

  formSubmissionDetail: async (
    _root,
    params,
    { models, subdomain }: IContext
  ) => {
    const { contentTypeId } = params;

    const conversation = await sendInboxMessage({
      subdomain,
      action: 'getConversation',
      data: { conversationId: contentTypeId },
      isRPC: true,
      defaultValue: null,
    });

    if (!conversation) {
      return null;
    }

    const submissions = await models.FormSubmissions.find({
      contentTypeId,
    }).lean();

    return {
      ...conversation,
      submissions,
    };
  },

  async formsGetContentTypes() {
    const services = await getServices();
    const formTypes: Array<{
      title: string;
      description: string;
      contentType: string;
      icon: string;
    }> = [
      {
        title: 'Lead generation',
        description: 'Generate leads through the form',
        contentType: 'leads',
        icon: 'users-alt',
      },
    ];

    for (const serviceName of services) {
      const service = await getService(serviceName);
      const meta = service.config?.meta || {};

      if (meta && meta.forms) {
        const { form = undefined } = meta.forms;

        if (form) {
          formTypes.push(form);
        }
      }
    }

    return formTypes;
  },
};

checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
