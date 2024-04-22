import { debugError } from './debuggers';
import { sendInboxMessage } from './messageBroker';
import { getInstagramUser } from './utils';
import { IModels } from './connectionResolver';
import { INTEGRATION_KINDS } from './constants';
import { getPostDetails, getPostLink } from './utils';
import { IIntegrationDocument } from './models/Integrations';
import { ICustomerDocument } from './models/definitions/customers';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

export const getOrCreatePostConversation = async (
  models: IModels,
  pageId: string,
  subdomain: string,
  postId: string,
  integration: IIntegrationDocument,
  customer: ICustomerDocument,
  params: any
) => {
  let postConversation = await models.PostConversations.findOne({
    postId
  });

  if (!postConversation) {
    const integration = await models.Integrations.findOne({
      instagramPageId: { $in: pageId }
    });

    if (!integration) {
      throw new Error('Integration not found');
    }
    const { accountId } = integration;
    const account = await models.Accounts.findOne({ _id: accountId });
    if (!account) {
      throw new Error('account not found');
    }

    const getPostDetail = await getPostLink(account.token, postId);
    const instagramPost = {
      postId: postId,
      content: getPostDetail.caption,
      recipientId: getPostDetail.ig_id,
      senderId: getPostDetail.ig_id,
      permalink_url: getPostDetail.permalink,
      timestamp: getPostDetail.timestamp
    };
    postConversation = await models.PostConversations.create(instagramPost);
  }
  return postConversation;
};
export const getOrCreateComment = async (
  models: IModels,
  subdomain: string,
  postConversation: any,
  commentParams: any,
  pageId: string,
  userId: string,
  integration: any,
  customer: any
) => {
  const { parent_id, id, text } = commentParams;
  const post_id = commentParams.media.id;
  const doc = {
    recipientId: pageId,
    senderId: userId,
    postId: post_id,
    comment_id: id,
    content: text,
    customerId: customer.erxesApiId,
    parentId: parent_id
  };
  if (parent_id) {
    await models.CommentConversationReply.create({
      ...doc
    });
  } else {
    await models.CommentConversation.create({
      ...doc
    });
  }
  let conversation;
  conversation = await models.CommentConversation.findOne({
    comment_id: id
  });
  if (conversation === null) {
    conversation = await models.CommentConversation.findOne({
      comment_id: commentParams.parent_id
    });
  }

  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: text,
          conversationId: conversation.erxesApiId
        })
      },
      isRPC: true
    });
    conversation.erxesApiId = apiConversationResponse?._id;
    await conversation.save();
  } catch (error) {
    await models.CommentConversation.deleteOne({
      _id: conversation?._id
    });
    throw new Error(error.message);
  }

  try {
    await sendInboxMessage({
      subdomain,
      action: 'conversationClientMessageInserted',
      data: {
        ...conversation?.toObject(),
        conversationId: conversation.erxesApiId
      }
    });
    graphqlPubsub.publish(
      `conversationMessageInserted:${conversation.erxesApiId}`,
      {
        conversationMessageInserted: {
          ...conversation?.toObject(),
          conversationId: conversation.erxesApiId
        }
      }
    );
  } catch {
    throw new Error(
      `Failed to update the database with the Erxes API response for this conversation.`
    );
  }
};

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  userId: string,
  facebookPageId: string | undefined,
  kind: string,
  facebookPageTokensMap?: { [key: string]: string }
) => {
  const integration = await models.Integrations.getIntegration({
    $and: [{ instagramPageId: { $in: pageId } }, { kind }]
  });
  let customer = await models.Customers.findOne({ userId });

  if (customer) {
    return customer;
  }
  // create customer
  let instagramUser = {} as {
    name: string;
    profile_pic: string;
    id: string;
  };

  try {
    instagramUser = await getInstagramUser(
      userId,
      facebookPageId || '',
      facebookPageTokensMap
    );
  } catch (e) {
    debugError(`Error during get customer info: ${e.message}`);
  }
  // save on integrations db
  try {
    customer = await models.Customers.create({
      userId,
      firstName: instagramUser.name,
      integrationId: integration.erxesApiId,
      profilePic: instagramUser.profile_pic
    });
  } catch (e) {
    throw new Error(
      e.message.includes('duplicate')
        ? 'Concurrent request: customer duplication'
        : e
    );
  }

  // save on api
  try {
    const apiCustomerResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: integration.erxesApiId,
          firstName: instagramUser.name,
          avatar: instagramUser.profile_pic,
          isUser: true
        })
      },
      isRPC: true
    });
    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await models.Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }
  return customer;
};
