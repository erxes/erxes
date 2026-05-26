import {
  ICursorPaginateParams,
  IUserDocument,
  Resolver,
} from 'erxes-api-shared/core-types';
import { cursorPaginate, cursorPaginateAggregation } from 'erxes-api-shared/utils';
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

const formQueries: Record<string, Resolver> = {
  /**
   * Forms list
   */
  async forms(_root, args: FormsArgs, context) {
    const { models, user } = context as IContext;
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

  async cpForms(_root, args: FormsArgs, context) {
    const { models, user } = context as IContext;
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

  async formsMain(_root: undefined, args: FormsArgs, context) {
    const { models, user } = context as IContext;
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

  async formsTotalCount(_root, args, context) {
    const { models, user } = context as IContext;
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

  async formSubmissions(
    _root,
    {
      formId,
      contentTypeIds,
      customerId,
      ...cursorParams
    }: {
      formId?: string;
      tagId?: string;
      contentTypeIds?: string[];
      customerId?: string;
      filters?: Array<{ operator: string; value: any; formFieldId: string }>;
    } & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const match: Record<string, any> = {};

    if (formId) match.formId = formId;
    if (customerId) match.customerId = customerId;
    if (contentTypeIds?.length) match.contentTypeId = { $in: contentTypeIds };

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'frontline_form_fields',
          localField: 'formFieldId',
          foreignField: '_id',
          as: '_formField',
        },
      },
      {
        $addFields: {
          formFieldText: { $arrayElemAt: ['$_formField.text', 0] },
          formFieldType: { $arrayElemAt: ['$_formField.type', 0] },
        },
      },
      {
        $group: {
          _id: '$groupId',
          customerId: { $first: '$customerId' },
          contentTypeId: { $first: '$contentTypeId' },
          createdAt: { $first: '$submittedAt' },
          formId: { $first: '$formId' },
          customFieldsData: { $first: '$customFieldsData' },
          submissions: {
            $push: {
              _id: '$_id',
              formId: '$formId',
              formFieldId: '$formFieldId',
              text: '$formFieldText',
              formFieldText: '$formFieldText',
              formFieldType: '$formFieldType',
              value: '$value',
              submittedAt: '$submittedAt',
            },
          },
        },
      },
    ];

    return cursorPaginateAggregation({
      model: models.FormSubmissions as any,
      pipeline,
      params: { ...cursorParams, orderBy: { createdAt: -1, _id: -1 } },
    });
  },

  async formSubmissionDetail(
    _root,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    if (!user?._id) throw new Error('Unauthorized');
    const submissions = await models.FormSubmissions.aggregate([
      { $match: { groupId: _id } },
      {
        $lookup: {
          from: 'frontline_form_fields',
          localField: 'formFieldId',
          foreignField: '_id',
          as: '_formField',
        },
      },
      {
        $addFields: {
          formFieldText: { $arrayElemAt: ['$_formField.text', 0] },
          formFieldType: { $arrayElemAt: ['$_formField.type', 0] },
          text: { $arrayElemAt: ['$_formField.text', 0] },
        },
      },
      { $project: { _formField: 0 } },
    ]);

    if (!submissions.length) return null;

    const first = submissions[0];

    return {
      _id,
      contentTypeId: first.contentTypeId,
      customerId: first.customerId,
      createdAt: first.submittedAt,
      customFieldsData: first.customFieldsData,
      submissions,
    };
  },

  async formDetail(_root, { _id }: { _id: string }, context) {
    const { models } = context as IContext;
    return models.Forms.findOne({ _id });
  },

  async cpFormDetail(_root, { _id }: { _id: string }, context) {
    const { models } = context as IContext;
    return models.Forms.findOne({ _id });
  },

};

export default formQueries;

formQueries.cpForms.wrapperConfig = {
  forClientPortal: true,
};

formQueries.cpFormDetail.wrapperConfig = {
  forClientPortal: true,
};
