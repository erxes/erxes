import { generateModels } from './connectionResolver';
import { debugFacebook } from './debuggers';
import { facebookGetCustomerPosts } from './helpers';
import { sendInboxMessage } from './messageBroker';

export default {
  collectItems: async ({ subdomain, data }) => {
    const { contentType, contentId } = data;
    const models = await generateModels(subdomain);

    const result: any[] = [];

    if (contentType === 'customer') {
      let conversationIds;

      try {
        conversationIds = await facebookGetCustomerPosts(models, data);

        const inboxConversations = await sendInboxMessage({
          subdomain,
          isRPC: true,
          action: 'getConversations',
          data: { query: { _id: { $in: conversationIds } } },
          defaultValue: []
        });

        for (const c of inboxConversations) {
          result.push({
            _id: c._id,
            contentType: 'comment',
            contentId,
            createdAt: c.createdAt
          });
        }
      } catch (e) {
        debugFacebook(e);
      }
    }

    return {
      data: result,
      status: 'success'
    };
  }
};
