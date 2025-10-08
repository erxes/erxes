import { IModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/facebook/debuggers';
import {
  ICommentParams,
  IPostParams,
} from '@/integrations/facebook/@types/utils';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { IFacebookCustomer } from '@/integrations/facebook/@types/customers';
import { getFacebookUser } from '@/integrations/facebook/utils';
import { receiveInboxMessage } from '~/modules/inbox/receiveMessage';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { pConversationClientMessageInserted } from '~/modules/inbox/graphql/resolvers/mutations/widget';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  getPostLink,
  getFacebookUserProfilePic,
  getPostDetails,
  uploadMedia,
} from '@/integrations/facebook/utils';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  userId: string,
  kind: string,
) => {
  const integration = await models.FacebookIntegrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind }],
  });

  const { facebookPageTokensMap = {} } = integration;

  let customer = await models.FacebookCustomers.findOne({ userId });
  if (customer) {
    return customer;
  }

  // Create customer
  let fbUser = {} as any;

  try {
    fbUser =
      (await getFacebookUser(models, pageId, facebookPageTokensMap, userId)) ||
      {};
  } catch (e: any) {
    debugError(`Error during get customer info: ${e.message}`);
  }

  const fbUserProfilePic: string | null = await getFacebookUserProfilePic(
    pageId,
    facebookPageTokensMap,
    userId,
    subdomain,
  );

  const profile = fbUserProfilePic || fbUser.profile_pic;

  // Save in integrations DB
  try {
    customer = await models.FacebookCustomers.create({
      userId,
      firstName: fbUser.first_name || fbUser.name,
      lastName: fbUser.last_name,
      integrationId: integration.erxesApiId,
      profilePic: profile,
    });
  } catch (e: any) {
    if (e.message?.includes('duplicate')) {
      throw new Error('Concurrent request: customer duplication');
    }
    throw e; // Preserve stack trace
  }

  // Save in core API (via receiveInboxMessage)
  try {
    const data = {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: fbUser.first_name || fbUser.name,
        lastName: fbUser.last_name,
        avatar: profile,
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
  } catch (e: any) {
    await models.FacebookCustomers.deleteOne({ _id: customer._id });
    // Re-throw with added context, preserving original stack
    throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
  }

  return customer;
};

export const getOrCreateComment = async (
  models: IModels,
  subdomain: string,
  commentParams: ICommentParams,
  pageId: string,
  userId: string,
  integration: IFacebookIntegrationDocument,
  customer: IFacebookCustomer,
) => {
  const mainConversation = await models.FacebookCommentConversation.findOne({
    comment_id: commentParams.comment_id,
  });
  const parentConversation = await models.FacebookCommentConversation.findOne({
    comment_id: commentParams.parent_id,
  });
  const replyConversation =
    await models.FacebookCommentConversationReply.findOne({
      comment_id: commentParams.comment_id,
    });
  if (mainConversation || replyConversation) {
    return;
  }
  const post = await models.FacebookPostConversations.findOne({
    postId: commentParams.post_id,
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
    recipientId: pageId,
    senderId: userId,
    createdAt: commentParams.post.updated_time,
    postId: commentParams.post_id,
    comment_id: commentParams.comment_id,
    content: commentParams.message,
    customerId: customer.erxesApiId,
    parentId: commentParams.parent_id,
  };
  if (parentConversation) {
    await models.FacebookCommentConversationReply.create({
      ...doc,
    });
  } else {
    await models.FacebookCommentConversation.create({
      ...doc,
    });
  }
  let conversation;
  conversation = await models.FacebookCommentConversation.findOne({
    comment_id: commentParams.comment_id,
  });
  if (conversation === null) {
    conversation = await models.FacebookCommentConversation.findOne({
      comment_id: commentParams.parent_id,
    });
  }
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
        `Conversation creation failed: ${JSON.stringify(
          apiConversationResponse,
        )}`,
      );
    }
  } catch (error) {
    await models.FacebookCommentConversation.deleteOne({
      _id: conversation?._id,
    });
    throw new Error(error.message);
  }
  try {
    const doc = {
      ...conversation?.toObject(),
      conversationId: conversation.erxesApiId,
    };
    await pConversationClientMessageInserted(subdomain, doc);

    await graphqlPubsub.publish(
      `conversationMessageInserted:${conversation.erxesApiId}`,
      {
        conversationMessageInserted: {
          ...conversation?.toObject(),
          conversationId: conversation.erxesApiId,
        },
      },
    );
  } catch {
    throw new Error(
      `Failed to update the database with the Erxes API response for this conversation.`,
    );
  }
};
export const generatePostDoc = async (
  postParams: any,
  pageId: string,
  userId: string,
  subdomain: string,
) => {
  const {
    post_id,
    id,
    link,
    photos,
    created_time,
    message,
    photo_id,
    video_id,
  } = postParams;
  let generatedMediaUrls: string[] = [];

  const { UPLOAD_SERVICE_TYPE } = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'users',
    action: 'getFileUploadConfigs',
    input: {},
  });
  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    if (link) {
      if (video_id) {
        const mediaUrl = await uploadMedia(subdomain, link, true);
        if (typeof mediaUrl === 'string') generatedMediaUrls.push(mediaUrl);
      } else if (photo_id) {
        const mediaUrl = await uploadMedia(subdomain, link, false);
        if (typeof mediaUrl === 'string') generatedMediaUrls.push(mediaUrl);
      }
    }

    if (photos && photos.length > 0) {
      const mediaUrls = await Promise.all(
        photos.map((url) => uploadMedia(subdomain, url, false)),
      );

      generatedMediaUrls = mediaUrls.filter(
        (url): url is string => url !== null && typeof url === 'string',
      );
    }
  }

  const doc = {
    postId: post_id || id,
    content: message || '...',
    recipientId: pageId,
    senderId: userId,
    permalink_url: '',
    attachments: generatedMediaUrls.length > 0 ? generatedMediaUrls : [],
    timestamp: created_time ? new Date(created_time) : undefined,
  };

  return doc;
};

export const getOrCreatePostConversation = async (
  models: IModels,
  pageId: string,
  postId: string,
  params: ICommentParams,
) => {
  try {
    let postConversation = await models.FacebookPostConversations.findOne({
      postId,
    });

    const facebookPost = await fetchFacebookPostDetails(pageId, models, params);
    if (!postConversation) {
      postConversation = await models.FacebookPostConversations.create(
        facebookPost,
      );
      return postConversation;
    } else {
      const hasPostContentChanged =
        facebookPost.content !== postConversation.content;

      if (hasPostContentChanged) {
        await models.FacebookPostConversations.updateOne(
          { postId },
          { $set: { content: facebookPost.content } },
        );
        const updatedPost = await models.FacebookPostConversations.findOne({
          postId,
        });
        return updatedPost;
      } else {
        return postConversation; // Return the existing post conversation without changes
      }
    }
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
  integration: IFacebookIntegrationDocument,
) => {
  const { post_id } = postParams;

  if (!post_id) {
    throw new Error('post_id is required');
  }

  let post = await models.FacebookPostConversations.findOne({
    postId: postParams.post_id,
  });

  if (post) {
    return post;
  }

  const { facebookPageTokensMap = {} } = integration;

  const postUrl = await getPostLink(
    pageId,
    facebookPageTokensMap,
    postParams.post_id || '',
  );
  const doc = await generatePostDoc(postParams, pageId, userId, subdomain);
  if (!doc.attachments && doc.content === '...') {
    throw new Error('Invalid post document: missing attachments and content');
  }

  doc.permalink_url = postUrl;
  post = await models.FacebookPostConversations.create(doc);

  return post;
};

export default async function fetchFacebookPostDetails(
  pageId: string,
  models: IModels,
  params: ICommentParams,
) {
  try {
    const integration = await models.FacebookIntegrations.findOne({
      $and: [
        { facebookPageIds: { $in: pageId } },
        { kind: INTEGRATION_KINDS.POST },
      ],
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    const { facebookPageTokensMap = {} } = integration;

    const getPostDetail = await getPostDetails(
      pageId,
      facebookPageTokensMap,
      params.post_id || '',
    );

    const facebookPost = {
      postId: params.post_id,
      content: getPostDetail.message || '',
      recipientId: pageId,
      senderId: pageId,
      permalink_url: getPostDetail.permalink_url || '',
      timestamp: getPostDetail.created_time,
    };

    return facebookPost;
  } catch (error) {
    throw new Error(`Failed to fetch post details: ${error.message}`);
  }
}
