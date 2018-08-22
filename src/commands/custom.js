import { connect, disconnect } from '../db/connection';
import { Conversations, ConversationMessages, Integrations, Customers } from '../db/models';
import { graphRequest, findPostComments } from '../trackers/facebookTracker';
import { getConfig, ActivityLogs } from '../trackers/facebook';

export const customCommand = async () => {
  connect();

  const getOrCreateCustomer = async (fbUserId, accessToken, integrationId) => {
    const customer = await Customers.findOne({ 'facebookData.id': fbUserId });

    if (customer) {
      return customer._id;
    }

    // get user info
    const res = await graphRequest.get(`/${fbUserId}`, accessToken);

    // get profile pic
    const getProfilePic = async fbId => {
      try {
        const response = await graphRequest.get(`/${fbId}/picture?height=600`);
        return response.image ? response.location : '';
      } catch (e) {
        return null;
      }
    };

    // when feed response will contain name field
    // when messeger response will not contain name field
    const firstName = res.first_name || res.name;
    const lastName = res.last_name || '';

    // create customer
    const createdCustomer = await Customers.createCustomer({
      firstName,
      lastName,
      integrationId,
      avatar: (await getProfilePic(fbUserId)) || '',
      facebookData: {
        id: fbUserId,
      },
    });

    // create log
    await ActivityLogs.createCustomerRegistrationLog(createdCustomer);

    return createdCustomer;
  };

  const conversations = await Conversations.find({
    facebookData: { $exists: true },
  });

  for (let conversation of conversations) {
    const msgs = await ConversationMessages.find({
      conversationId: conversation._id,
    });

    const post = msgs.find(message => message.facebookData.isPost);

    if (!post) {
      const integration = await Integrations.findOne({
        _id: conversation.integrationId,
      });

      const FACEBOOK_APPS = getConfig();

      const app = FACEBOOK_APPS.find(a => a.id === integration.facebookData.appId);

      let response = await graphRequest.get(
        '/me/accounts?limit=100&fields=access_token',
        app.accessToken,
      );
      const { data } = response;

      const page = data.find(page => page.id === conversation.facebookData.pageId);

      const accessToken = page.access_token;
      const postId = conversation.facebookData.postId;

      const fields = `/${postId}?fields=caption,description,link,picture,source,message,from`;

      response = await graphRequest.get(fields, accessToken);

      const msgParams = {
        conversationId: conversation._id,
        customerId: await getOrCreateCustomer(response.from.id, accessToken, integration._id),
      };

      await ConversationMessages.createMessage({
        ...msgParams,
        content: response.message,
        facebookData: {
          senderId: response.from.id,
          senderName: response.from.name,
          item: 'status',
          link: response.link,
          isPost: true,
        },
        internal: false,
      });

      const comments = await findPostComments(accessToken, conversation.facebookData.postId, []);

      for (let comment of comments) {
        await ConversationMessages.createMessage({
          ...msgParams,
          content: comment.message,
          facebookData: {
            postId: postId,
            commentId: comment.id,
            item: 'comment',
            senderId: comment.from.id,
            senderName: comment.from.name,
            parentId: comment.parent ? comment.parent.id : null,
          },
          internal: false,
        });
      }
    }
  }

  disconnect();
};

customCommand();
