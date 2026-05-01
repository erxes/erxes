import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { IInstagramCustomer } from '@/integrations/instagram/@types/customers';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import {
  ICommentParams,
  IPostParams,
} from '@/integrations/instagram/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/instagram/constants';
import { debugError } from '@/integrations/instagram/debuggers';
import {
  getInstagramUser,
  getPageAccessTokenFromMap,
  getPostDetails,
  getPostLink,
} from '@/integrations/instagram/utils';
import { IModels } from '~/connectionResolvers';

/**
 * Sanitize a value expected to be a string to prevent NoSQL injection.
 * Coerces non-string values (e.g. numbers) to strings, which also neutralizes
 * injection objects like {"$gt": ""} by converting them to "[object Object]".
 */
const sanitizeString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  return String(value ?? '');
};

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  userId: string,
  kind: string,
) => {
  const safePageId = sanitizeString(pageId);
  const safeUserId = sanitizeString(userId);

  const integration = await models.InstagramIntegrations.findOne({
    instagramPageId: { $eq: safePageId },
    kind: { $eq: kind },
  });
  if (!integration) {
    throw new Error('Instagram Integration not found ');
  }
  let customer = await models.InstagramCustomers.findOne({
    userId: { $eq: safeUserId },
  });
  if (customer) {
    return customer;
  }
  // create customer
  let instagramUser = {} as {
    name: string;
    username: string;
    profile_pic: string;
    id: string;
  };
  let firstName;
  try {
    instagramUser = await getInstagramUser(
      safeUserId,
      integration.facebookPageId || '',
      integration.facebookPageTokensMap,
    );
    if (instagramUser) {
      firstName = instagramUser.username || instagramUser.name;
    }
  } catch (e) {
    debugError(`Failed to fetch Instagram user profile: ${e.message}`);
  }
  if (firstName) {
    try {
      customer = await models.InstagramCustomers.create({
        userId: safeUserId,
        firstName,
        integrationId: integration.erxesApiId,
        profilePic: instagramUser.profile_pic,
      });
    } catch (e) {
      throw new Error(
        e.message.includes('duplicate')
          ? 'Concurrent request: customer duplication'
          : e.message,
      );
    }

    // save on api
    try {
      const data = {
        action: 'get-create-update-customer',
        payload: JSON.stringify({
          integrationId: integration.erxesApiId,
          firstName: firstName,
          avatar: instagramUser.profile_pic,
          isUser: true,
        }),
      };

      const apiCustomerResponse = await receiveInboxMessage(subdomain, data);

      if (apiCustomerResponse.status === 'success') {
        customer.erxesApiId = apiCustomerResponse.data._id;
        await customer.save();
      } else {
        throw new Error(
          `Customer creation failed: ${JSON.stringify(apiCustomerResponse)}`,
        );
      }
    } catch (e) {
      await models.InstagramCustomers.deleteOne({ _id: customer._id });
      throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
    }
  }

  return customer;
};

export const getOrCreateComment = async (
  models: IModels,
  subdomain: string,
  commentParams: ICommentParams,
  pageId: string,
  userId: string,
  integration: IInstagramIntegrationDocument,
  customer: IInstagramCustomer,
) => {
  const safePageId = sanitizeString(pageId);
  const safeUserId = sanitizeString(userId);
  const safeCommentId = sanitizeString(commentParams.comment_id);
  const safeParentId = sanitizeString(commentParams.parent_id);
  const safePostId = sanitizeString(commentParams.post_id);

  const mainConversation = await models.InstagramCommentConversation.findOne({
    comment_id: { $eq: safeCommentId },
  });
  const parentConversation = await models.InstagramCommentConversation.findOne({
    comment_id: { $eq: safeParentId },
  });
  const replyConversation =
    await models.InstagramCommentConversationReply.findOne({
      comment_id: { $eq: safeCommentId },
    });
  if (mainConversation || replyConversation) {
    return;
  }
  const post = await models.InstagramPostConversations.findOne({
    postId: { $eq: safePostId },
  });
  let attachment: any[] = [];
  if (commentParams.photo) {
    attachment = [
      {
        name: 'Photo', // You can set a name for the attachment
        url: commentParams.photo,
        type: 'image',
      },
    ];
  }
  if (!post) {
    throw new Error('Post not found');
  }
  const doc = {
    attachments: attachment,
    recipientId: safePageId,
    senderId: safeUserId,
    createdAt: commentParams.post?.updated_time || new Date(),
    postId: safePostId,
    comment_id: safeCommentId,
    content: commentParams.message,
    customerId: customer.erxesApiId,
    parentId: safeParentId,
  };
  if (parentConversation) {
    await models.InstagramCommentConversationReply.create({
      ...doc,
    });
  } else {
    await models.InstagramCommentConversation.create({
      ...doc,
    });
  }
  const conversation =
    (await models.InstagramCommentConversation.findOne({
      comment_id: { $eq: safeCommentId },
    })) ||
    (await models.InstagramCommentConversation.findOne({
      comment_id: { $eq: safeParentId },
    }));

  if (!conversation) {
    throw new Error('Comment conversation not found after creation');
  }

  const isNewConversation = !conversation.erxesApiId;

  try {
    const data = {
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content: commentParams.message,
        attachments: attachment,
        conversationId: conversation.erxesApiId,
      }),
    };

    const apiConversationResponse = await receiveInboxMessage(subdomain, data);

    if (apiConversationResponse.status === 'success') {
      conversation.erxesApiId = apiConversationResponse.data._id;
      await conversation.save();
    } else {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(apiConversationResponse)}`,
      );
    }
  } catch (error) {
    if (isNewConversation) {
      await models.InstagramCommentConversation.deleteOne({
        _id: conversation._id,
      });
    }
    throw new Error(error.message);
  }
  try {
    const message = await models.ConversationMessages.createMessage({
      conversationId: conversation.erxesApiId,
      content: commentParams.message || '',
      customerId: customer.erxesApiId,
      attachments: attachment,
      createdAt: new Date(),
    } as any);

    await pConversationClientMessageInserted(subdomain, {
      ...message.toObject(),
      conversationId: conversation.erxesApiId,
    });
  } catch {
    throw new Error(
      `Failed to update the database with the Erxes API response for this conversation.`,
    );
  }
};
export const generatePostDoc = (
  postParams: any,
  pageId: string,
  userId: string,
) => {
  const { post_id, id, created_time, message } = postParams;

  return {
    postId: post_id || id,
    content: message || '...',
    recipientId: pageId,
    senderId: userId,
    permalink_url: '',
    attachments: [],
    timestamp: created_time ? new Date(created_time) : undefined,
  };
};

export const getOrCreatePostConversation = async (
  models: IModels,
  pageId: string,
  postId: string,
) => {
  try {
    const safePageId = sanitizeString(pageId);
    const safePostId = sanitizeString(postId);

    let postConversation = await models.InstagramPostConversations.findOne({
      postId: { $eq: safePostId },
    });
    if (!postConversation) {
      const integration = await models.InstagramIntegrations.findOne({
        instagramPageId: { $eq: safePageId },
      });

      if (!integration) {
        throw new Error('Integration not found');
      }
      const { accountId } = integration;
      const account = await models.InstagramAccounts.findOne({
        _id: { $eq: accountId },
      });
      if (!account) {
        throw new Error('account not found');
      }

      const getPostDetail = await getPostLink(account.token, safePostId);
      const instagramPost = {
        postId: safePostId,
        content: getPostDetail.caption,
        recipientId: getPostDetail.ig_id,
        senderId: getPostDetail.ig_id,
        permalink_url: getPostDetail.permalink,
        timestamp: getPostDetail.timestamp,
      };
      postConversation =
        await models.InstagramPostConversations.create(instagramPost);
    }
    return postConversation;

  } catch (error) {
    throw new Error(
      `Failed to get or create post conversation: ${error.message}`,
    );
  }
};





export const getOrCreatePost = async (
  models: IModels,
  subdomain: string,
  postParams: IPostParams,
  pageId: string,
  userId: string,
  integration: IInstagramIntegrationDocument,
) => {
  const { post_id } = postParams;

  if (!post_id) {
    throw new Error('post_id is required');
  }

  let post = await models.InstagramPostConversations.findOne({
    postId: { $eq: sanitizeString(postParams.post_id) },
  });

  if (post) {
    return post;
  }

  const { facebookPageTokensMap = {} } = integration;
  const pageAccessToken = getPageAccessTokenFromMap(
    pageId,
    facebookPageTokensMap,
  );

  const postUrl = await getPostLink(pageAccessToken, postParams.post_id || '');
  const doc = generatePostDoc(postParams, pageId, userId);
  if (!doc.content || doc.content === '...') {
    throw new Error('Invalid post document: missing content');
  }

  doc.permalink_url = postUrl;
  post = await models.InstagramPostConversations.create(doc);

  return post;
};

export async function fetchInstagramPostDetails(
  pageId: string,
  models: IModels,
  params: ICommentParams,
) {
  const safePageId = sanitizeString(pageId);
  const safePostId = sanitizeString(params.post_id || '');

  const integration = await models.InstagramIntegrations.findOne({
    $and: [
      { facebookPageId: { $eq: safePageId } },
      { kind: { $eq: INTEGRATION_KINDS.POST } },
    ],
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const { facebookPageTokensMap = {} } = integration;

  const postDetail = await getPostDetails(
    safePageId,
    facebookPageTokensMap,
    safePostId,
  );

  if (!postDetail) {
    throw new Error(`Failed to fetch post details for post ${safePostId}`);
  }

  return {
    postId: safePostId,
    content: postDetail.message || '',
    recipientId: safePageId,
    senderId: safePageId,
    permalink_url: postDetail.permalink_url || '',
    timestamp: postDetail.created_time,
  };
}
