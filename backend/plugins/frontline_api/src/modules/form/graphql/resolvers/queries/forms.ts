import { ICursorPaginateParams, IUserDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate, PERMISSION_ROLES } from 'erxes-api-shared/utils';
import { IContext, IModels } from '~/connectionResolvers';

interface FilterArgs {
  type?: string;
  channelId?: string;
  searchValue?: string;
  tag?: string;
  status?: string;
}
const generateFilterQuery = async (
  { type, channelId, searchValue, status }: FilterArgs,
  models: IModels,
  user: IUserDocument,
) => {
  const query: any = {};

  if (type) {
    query.type = type;
  }

  if (channelId) {
    query.channelId = channelId;
    return query;
  }

  if (!channelId && !user?.isOwner) {
    const channelMemberships = await models.ChannelMembers.find({
      memberId: user._id,
    }).lean();

    let channelIds = channelMemberships.map((m) => m.channelId);

    if (channelId) {
      channelIds = [channelId];
    }

    if (channelIds.length === 0) {
      return { integrationId: { $in: [] } };
    }

    const integrations = await models.Integrations.find({
      channelId: { $in: channelIds },
    }).lean();

    const availIntegrationIds = integrations.map((i) => i._id.toString());
    query.integrationId = { $in: availIntegrationIds };
  }

  if (searchValue) {
    query.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  // if (tag) {
  //   const object = await models.Tags.findOne({ _id: tag });

  //   query.tagIds = { $in: [tag, ...(object?.relatedIds || [])] };
  // }

  if (status) {
    query.status = status;
  }

  return query;
};

type FormsArgs = {
  type: string;
  searchValue?: string;
  channelId?: string;
  tag?: string;
  status?: string;
  sortField?: string;
  sortDirection?: 1 | -1;
} & ({ page: number; perPage: number } | ICursorPaginateParams);

const formQueries = {
  /**
   * Forms list
   */
  async forms(_root, args: FormsArgs, { models, user }: IContext) {
    const qry = {
      ...(await generateFilterQuery(args, models, user)),
    };
    if (args.type === 'lead') {
      return models.Forms.findLeadForms(qry, args);
    }

    return cursorPaginate({
      model: models.Forms as any,
      params: { ...args, orderBy: { createdAt: 1 } },
      query: { ...qry },
    });
  },

  async formsMain(
    _root: undefined,
    args: FormsArgs,
    { models, user }: IContext,
  ) {
    const qry = {
      ...(await generateFilterQuery(args, models, user)),
    };

    if (args.type === 'lead') {
      return models.Forms.findLeadForms(qry, args);
    }

    return cursorPaginate({
      model: models.Forms as any,
      params: { ...args, orderBy: { createdAt: 1 } },
      query: { ...qry },
    });
  },

  async formsTotalCount(_root, args, { models, user }: IContext) {
    const counts = {
      total: 0,
      byTag: {},
      byChannel: {},
      byStatus: { active: 0, archived: 0 },
    };

    const qry = {
      ...(await generateFilterQuery(args, models, user)),
    };
    console.log('qry:::', qry);
    const count = async (query) => {
      return models.Forms.find(query).countDocuments();
    };
    // const tags = await models.Tags.find({ type: `form:${args.type}` }).lean();

    // for (const tag of tags) {
    //   const countQueryResult = await count({ tagIds: tag._id, ...qry });

    //   counts.byTag[tag._id] = !args.tag
    //     ? countQueryResult
    //     : args.tag === tag._id
    //     ? countQueryResult
    //     : 0;
    // }

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
    console.log('count', qry);

    return counts;
  },

  // /**
  //  * Get one form
  //  */
  async formDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Forms.findOne({ _id });
  },

  // async formSubmissions(
  //   _root,
  //   {
  //     formId,
  //     tagId,
  //     contentTypeIds,
  //     customerId,
  //     filters,
  //     page,
  //     perPage,
  //   }: {
  //     formId: string;
  //     tagId: string;
  //     contentTypeIds: string[];
  //     customerId: string;
  //     filters: IFormSubmissionFilter[];
  //     page: number;
  //     perPage: number;
  //   },
  //   { subdomain, models }: IContext,
  // ) {
  //   // const convsSelector = await formSubmissionsQuery(subdomain, models, {
  //   //   formId,
  //   //   tagId,
  //   //   contentTypeIds,
  //   //   customerId,
  //   //   filters,
  //   // });

  //   // const conversations = await sendInboxMessage({
  //   //   subdomain,
  //   //   action: 'getConversationsList',
  //   //   data: { query: convsSelector, listParams: { page, perPage } },
  //   //   isRPC: true,
  //   //   defaultValue: [],
  //   // });

  //   // const result: any[] = [];

  //   // for (const conversation of conversations) {
  //   //   const submissions = await models.FormSubmissions.find({
  //   //     contentTypeId: conversation._id,
  //   //   }).lean();

  //   //   conversation.contentTypeId = conversation._id;
  //   //   conversation.submissions = submissions;
  //   //   result.push(conversation);
  //   // }

  //   // return result;

  //   try {
  //     // Calculate pagination params
  //     const skip = (page - 1) * perPage;

  //     // Fetch grouped submissions by groupId, with pagination
  //     const submissions = await models.FormSubmissions.aggregate([
  //       { $match: { formId } }, // Match submissions by formId
  //       {
  //         $group: {
  //           _id: '$groupId', // Group by groupId (unique per user submission group)
  //           submissions: {
  //             $push: {
  //               _id: '$_id',
  //               formId: '$formId',
  //               formFieldId: '$formFieldId',
  //               text: '$text',
  //               formFieldText: '$formFieldText',
  //               value: '$value',
  //               submittedAt: '$submittedAt',
  //             },
  //           },
  //           customerId: { $first: '$customerId' }, // Take the first customerId in the group
  //           contentTypeId: { $first: '$contentTypeId' }, // Take the first contentTypeId
  //           createdAt: { $first: '$submittedAt' }, // Take the earliest submission date
  //           customFieldsData: { $first: '$customFieldsData' }, // First customFieldsData
  //         },
  //       },
  //       { $skip: skip }, // Skip for pagination
  //       { $limit: perPage }, // Limit for pagination
  //     ]);

  //     // Return single submission per groupId
  //     return submissions.map((submission) => ({
  //       _id: submission._id, // The groupId is used as the _id
  //       contentTypeId: submission._id,
  //       customerId: submission.customerId,
  //       // Assuming Customer schema
  //       createdAt: submission.createdAt,
  //       customFieldsData: submission.customFieldsData,
  //       submissions: submission.submissions, // All grouped form submissions
  //     }));
  //   } catch (error) {
  //     throw new Error('Error fetching form submissions');
  //   }
  // },

  // async formSubmissionsTotalCount(
  //   _root,
  //   {
  //     formId,
  //     tagId,
  //     contentTypeIds,
  //     customerId,
  //     filters,
  //   }: {
  //     formId: string;
  //     tagId: string;
  //     contentTypeIds: string[];
  //     customerId: string;
  //     filters: IFormSubmissionFilter[];
  //   },
  //   { models }: IContext,
  // ) {
  //   const result = await models.FormSubmissions.aggregate([
  //     // Step 1: Filter submissions with contentType "lead"
  //     {
  //       $match: {
  //         formId,
  //       },
  //     },
  //     // Step 2: Group by both groupId and customerId to get unique submissions per user
  //     {
  //       $group: {
  //         _id: {
  //           groupId: '$groupId', // Group by groupId // Ensure unique by customerId (user)
  //         },
  //       },
  //     },
  //     // Step 3: Group by groupId to count unique submissions
  //     {
  //       $count: 'totalUniqueCount', // Return the total number of unique submissions
  //     },
  //   ]);

  //   return result[0].totalUniqueCount;
  // },

  // formSubmissionDetail: async (
  //   _root,
  //   params,
  //   { models, subdomain }: IContext,
  // ) => {
  //   const { contentTypeId } = params;

  //   const conversation = await models.Conversations.findOne({
  //     _id: contentTypeId,
  //   });

  //   if (!conversation) {
  //     return null;
  //   }

  //   const submissions = await models.FormSubmissions.find({
  //     contentTypeId,
  //   }).lean();

  //   return {
  //     ...conversation,
  //     submissions,
  //   };
  // },

  // async formsGetContentTypes() {
  //   // const services = await getServices();
  //   // const formTypes: Array<{
  //   //   title: string;
  //   //   description: string;
  //   //   contentType: string;
  //   //   icon: string;
  //   // }> = [
  //   //   {
  //   //     title: 'Lead generation',
  //   //     description: 'Generate leads through the form',
  //   //     contentType: 'leads',
  //   //     icon: 'users-alt',
  //   //   },
  //   // ];
  //   // for (const serviceName of services) {
  //   //   const service = await getService(serviceName);
  //   //   const meta = service.config?.meta || {};
  //   //   if (meta && meta.forms) {
  //   //     const { form = undefined } = meta.forms;
  //   //     if (form) {
  //   //       formTypes.push(form);
  //   //     }
  //   //   }
  //   // }
  //   // return formTypes;
  // },
};

// checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
