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

    if (args.type === 'lead') {
      return models.Forms.findLeadForms(qry, args);
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
    // const convsSelector = await formSubmissionsQuery(subdomain, models, {
    //   formId,
    //   tagId,
    //   contentTypeIds,
    //   customerId,
    //   filters,
    // });

    // const conversations = await sendInboxMessage({
    //   subdomain,
    //   action: 'getConversationsList',
    //   data: { query: convsSelector, listParams: { page, perPage } },
    //   isRPC: true,
    //   defaultValue: [],
    // });

    // const result: any[] = [];

    // for (const conversation of conversations) {
    //   const submissions = await models.FormSubmissions.find({
    //     contentTypeId: conversation._id,
    //   }).lean();

    //   conversation.contentTypeId = conversation._id;
    //   conversation.submissions = submissions;
    //   result.push(conversation);
    // }

    // return result;

    try {
      // Calculate pagination params
      const skip = (page - 1) * perPage;

      // Fetch grouped submissions by groupId, with pagination
      const submissions = await models.FormSubmissions.aggregate([
        { $match: { formId } }, // Match submissions by formId
        {
          $group: {
            _id: "$groupId", // Group by groupId (unique per user submission group)
            submissions: {
              $push: {
                _id: "$_id",
                formId: "$formId",
                formFieldId: "$formFieldId",
                text: "$text",
                formFieldText: "$formFieldText",
                value: "$value",
                submittedAt: "$submittedAt",
              },
            },
            customerId: { $first: "$customerId" }, // Take the first customerId in the group
            contentTypeId: { $first: "$contentTypeId" }, // Take the first contentTypeId
            createdAt: { $first: "$submittedAt" }, // Take the earliest submission date
            customFieldsData: { $first: "$customFieldsData" }, // First customFieldsData
          },
        },
        { $skip: skip }, // Skip for pagination
        { $limit: perPage }, // Limit for pagination
      ]);

      // Return single submission per groupId
      return submissions.map(submission => ({
        _id: submission._id, // The groupId is used as the _id
        contentTypeId: submission._id,
        customerId: submission.customerId,
    // Assuming Customer schema
        createdAt: submission.createdAt,
        customFieldsData: submission.customFieldsData,
        submissions: submission.submissions, // All grouped form submissions
      }));
    } catch (error) {
      throw new Error("Error fetching form submissions");
    }
  
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
    { models }: IContext
  ) {
    const result = await models.FormSubmissions.aggregate([
      // Step 1: Filter submissions with contentType "lead"
      {
        $match: {
          formId,
        },
      },
      // Step 2: Group by both groupId and customerId to get unique submissions per user
      {
        $group: {
          _id: {
            groupId: '$groupId', // Group by groupId // Ensure unique by customerId (user)
          },
        },
      },
      // Step 3: Group by groupId to count unique submissions
      {
        $count: 'totalUniqueCount', // Return the total number of unique submissions
      },
    ]);

    return result[0].totalUniqueCount;
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
