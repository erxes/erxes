import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import { sendInboxMessage } from '../../../messageBroker';
import { IFormSubmissionFilter } from '../../../models/definitions/forms';
import { formSubmissionsQuery } from '../../../utils';

const formQueries = {
  /**
   * Forms list
   */
  forms(_root, _args, { commonQuerySelector, models }: IContext) {
    return models.Forms.find(commonQuerySelector).sort({ title: 1 });
  },

  /**
   * Get one form
   */
  formDetail(_root, { _id }: { _id: string }, { models }: IContext) {
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
      perPage
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
      filters
    });

    const conversations = await sendInboxMessage({
      subdomain,
      action: 'getConversationsList',
      data: { query: convsSelector, listParams: { page, perPage } },
      isRPC: true,
      defaultValue: []
    });

    const result: any[] = [];

    for (const conversation of conversations) {
      const submissions = await models.FormSubmissions.find({
        contentTypeId: conversation._id
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
      filters
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
      filters
    });

    return await sendInboxMessage({
      subdomain,
      action: 'conversations.count',
      data: { query: convsSelector },
      isRPC: true,
      defaultValue: []
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
      defaultValue: null
    });

    if (!conversation) {
      return null;
    }

    const submissions = await models.FormSubmissions.find({
      contentTypeId
    }).lean();

    return {
      ...conversation,
      submissions
    };
  }
};

checkPermission(formQueries, 'forms', 'showForms', []);

export default formQueries;
