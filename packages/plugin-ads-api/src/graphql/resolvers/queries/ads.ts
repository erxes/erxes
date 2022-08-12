import { IContext, models } from '../../../connectionResolver';

const adsQueries = {
  formSubmissionDetail: async (_root, params, { models }) => {
    const { contentTypeId } = params;
    const conversation = await models.Conversations.findOne({
      _id: contentTypeId
    }).lean();

    if (!conversation) {
      throw new Error('Form Submission not found');
    }

    const submissions = await models.FormSubmissions.find({
      contentTypeId
    }).lean();

    return {
      ...conversation,
      contentTypeId: conversation._id,
      submissions
    };
  },

  formSubmissionsByCustomer: async (_root, params, { models }) => {
    const { customerId, tagId, page, perPage, filters } = params;

    const integrationsSelector: any = { kind: 'lead', isActive: true };
    let conversationIds: string[] = [];

    if (tagId) {
      integrationsSelector.tagIds = tagId;
    }

    const submissionFilters: any[] = [];

    if (filters && filters.length > 0) {
      for (const filter of filters) {
        const { formFieldId, value } = filter;

        switch (filter.operator) {
          case 'eq':
            submissionFilters.push({
              formFieldId,
              value: { $eq: value }
            });
            break;

          case 'c':
            submissionFilters.push({
              formFieldId,
              value: { $regex: new RegExp(value) }
            });
            break;

          case 'gte':
            submissionFilters.push({
              formFieldId,
              value: { $gte: value }
            });
            break;

          case 'lte':
            submissionFilters.push({
              formFieldId,
              value: { $lte: value }
            });
            break;

          default:
            break;
        }
      }

      const subs = await models.FormSubmissions.find({
        $and: submissionFilters
      }).lean();
      conversationIds = subs.map(e => e.contentTypeId);
    }

    const integration = await models.Integrations.findOne(
      integrationsSelector
    ).lean();

    if (!integration) {
      return null;
    }

    let convsSelector: any = {
      integrationId: integration._id,
      customerId
    };

    if (conversationIds.length > 0) {
      convsSelector = { _id: { $in: conversationIds }, customerId };
    }

    return models.Conversations.aggregate([
      { $match: convsSelector },
      {
        $project: {
          _id: 0,
          contentTypeId: '$_id',
          customerId: 1,
          createdAt: 1,
          customFieldsData: 1
        }
      },
      {
        $lookup: {
          from: 'form_submissions',
          localField: 'contentTypeId',
          foreignField: 'contentTypeId',
          as: 'submissions'
        }
      },
      { $skip: perPage * (page - 1) },
      { $limit: perPage }
    ]);
  },
  adReview: async (_root, params, { models: { AdReview } }: IContext) => {
    const { adId } = params;
    return AdReview.getAdReview(adId);
  }
};

export default adsQueries;
