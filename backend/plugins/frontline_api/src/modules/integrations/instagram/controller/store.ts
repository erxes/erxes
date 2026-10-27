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
import { getErrorMessage } from '@/integrations/utils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { z } from 'zod';
import {
  getOrCreateInstagramRecord,
  instagramRecordId,
  syncInstagramInboxMessage,
  withInstagramDeliveryLease,
} from '@/integrations/instagram/services/persistence';

const entityResponseSchema = z.object({ _id: z.string().min(1) });

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  integration: Pick<
    IInstagramIntegrationDocument,
    'erxesApiId' | 'facebookPageId' | 'facebookPageTokensMap'
  >,
  userId: string,
  username?: string,
) => {
  let customer = await models.InstagramCustomers.findOne({ userId });
  if (customer?.erxesApiId) {
    return customer;
  }
  let instagramUser: {
    name?: string | null;
    username?: string | null;
    profile_pic?: string | null;
  } = {};
  try {
    instagramUser =
      (await getInstagramUser(
        userId,
        integration.facebookPageId || '',
        integration.facebookPageTokensMap,
      )) || {};
  } catch (e) {
    debugError(`Failed to fetch Instagram user profile: ${getErrorMessage(e)}`);
  }
  // Like Facebook, identify the sender by provider ID; profile data is optional.
  const firstName =
    instagramUser.username || username || instagramUser.name || undefined;
  customer = await getOrCreateInstagramRecord(
    () => models.InstagramCustomers.findOne({ userId }),
    () =>
      models.InstagramCustomers.create({
        userId,
        firstName,
        integrationId: integration.erxesApiId,
        profilePic: instagramUser.profile_pic,
      }),
  );
  if (customer.erxesApiId) return customer;

  // Reuse the Core ID after a crash between Core creation and saving its link.
  const coreId = `instagram-${customer._id}`;
  const existing: unknown = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: { query: { _id: coreId } },
  });
  const recovered = entityResponseSchema.safeParse(existing);
  if (recovered.success) {
    customer.erxesApiId = recovered.data._id;
    await customer.save();
    return customer;
  }

  try {
    const data = {
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        _id: coreId,
        integrationId: integration.erxesApiId,
        firstName: customer.firstName,
        avatar: customer.profilePic,
        isUser: true,
      }),
    };

    const apiCustomerResponse = await receiveInboxMessage(subdomain, data);

    if (apiCustomerResponse.status === 'success') {
      customer.erxesApiId = entityResponseSchema.parse(
        apiCustomerResponse.data,
      )._id;
      await customer.save();
    } else {
      throw new Error(
        `Customer creation failed: ${JSON.stringify(apiCustomerResponse)}`,
      );
    }
  } catch (e) {
    throw new Error(`Failed to sync with API: ${getErrorMessage(e)}`);
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
  const commentId = commentParams.comment_id;
  if (!commentId) throw new Error('Instagram comment ID is required');
  const selector = { comment_id: commentId, recipientId: pageId };
  let mainConversation = await models.InstagramCommentConversation.findOne(
    selector,
  );
  let replyConversation =
    await models.InstagramCommentConversationReply.findOne(selector);
  const existing = mainConversation || replyConversation;
  // Historical rows have no pending marker; preserve their duplicate handling.
  if (existing && existing.inboxSyncPending !== true) return;

  const parentConversation = commentParams.parent_id
    ? await models.InstagramCommentConversation.findOne({
        comment_id: commentParams.parent_id,
        recipientId: pageId,
      })
    : null;
  const post = await models.InstagramPostConversations.findOne({
    postId: commentParams.post_id,
  });
  if (!post) throw new Error('Post not found');

  const attachments = commentParams.photo
    ? [{ name: 'Photo', url: commentParams.photo, type: 'image' }]
    : [];
  const doc = {
    _id: instagramRecordId('comment', pageId, commentId),
    attachments,
    recipientId: pageId,
    senderId: userId,
    createdAt: commentParams.post?.updated_time || new Date(),
    postId: commentParams.post_id,
    comment_id: commentId,
    content: commentParams.message,
    customerId: customer.erxesApiId,
    parentId: commentParams.parent_id,
    inboxSyncPending: true,
  };

  if (!existing) {
    if (parentConversation) {
      replyConversation = await getOrCreateInstagramRecord(
        () => models.InstagramCommentConversationReply.findOne(selector),
        () => models.InstagramCommentConversationReply.create(doc),
      );
    } else {
      mainConversation = await getOrCreateInstagramRecord(
        () => models.InstagramCommentConversation.findOne(selector),
        () => models.InstagramCommentConversation.create(doc),
      );
    }
  }

  const stored = mainConversation || replyConversation;
  const conversation = mainConversation || parentConversation;
  if (!stored || !conversation) {
    throw new Error('Comment conversation not found after creation');
  }

  await withInstagramDeliveryLease(
    mainConversation
      ? models.InstagramCommentConversation
      : models.InstagramCommentConversationReply,
    String(stored._id),
    async () => {
      const response = await receiveInboxMessage(subdomain, {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customer.erxesApiId,
          integrationId: integration.erxesApiId,
          content: commentParams.message,
          attachments,
          conversationId:
            conversation.erxesApiId || `instagram-${conversation._id}`,
        }),
      });
      if (response.status !== 'success') {
        throw new Error(
          `Conversation creation failed: ${response.errorMessage}`,
        );
      }
      conversation.erxesApiId = entityResponseSchema.parse(response.data)._id;
      await conversation.save();

      await syncInstagramInboxMessage(
        models,
        subdomain,
        `instagram-${stored._id}`,
        {
          conversationId: conversation.erxesApiId,
          content: commentParams.message || '',
          customerId: customer.erxesApiId,
          attachments,
          createdAt: stored.createdAt || new Date(),
          providerData: { messageId: commentId },
        },
      );
    },
  );
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

const postDetailsSchema = z.object({
  id: z.string().min(1),
  caption: z.string().nullish(),
  permalink: z.string().min(1),
  timestamp: z.coerce.date().optional(),
});

export const getOrCreatePostConversation = async (
  models: IModels,
  pageId: string,
  postId: string,
) => {
  let post = await models.InstagramPostConversations.findOne({ postId });
  if (post && !post.metadataPending) return post;

  const integration = await models.InstagramIntegrations.findOne({
    instagramPageId: pageId,
    kind: INTEGRATION_KINDS.POST,
  });
  if (!integration) throw new Error('Instagram Post integration not found');
  const account = await models.InstagramAccounts.findOne({
    _id: integration.accountId,
  });
  if (!account) throw new Error('Instagram account not found');

  let details: z.infer<typeof postDetailsSchema> | undefined;
  try {
    details = postDetailsSchema.parse(await getPostLink(account.token, postId));
  } catch (error) {
    // Post previews are optional. Retry on a later comment while preserving
    // this comment's known post ID and sender, as for optional profile data.
    debugError(
      `Failed to fetch Instagram post preview: ${getErrorMessage(error)}`,
    );
  }
  const metadata = {
    content: details?.caption || '',
    permalink_url: details?.permalink || '',
    timestamp: details?.timestamp,
    metadataPending: !details,
  };
  if (post) {
    if (details) {
      Object.assign(post, metadata);
      await post.save();
    }
    return post;
  }
  post = await getOrCreateInstagramRecord(
    () => models.InstagramPostConversations.findOne({ postId }),
    () =>
      models.InstagramPostConversations.create({
        _id: instagramRecordId('post', pageId, postId),
        postId,
        recipientId: pageId,
        senderId: pageId,
        integrationId: integration._id,
        ...metadata,
      }),
  );
  return post;
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
    postId: postParams.post_id,
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
  const integration = await models.InstagramIntegrations.findOne({
    $and: [{ facebookPageId: pageId }, { kind: INTEGRATION_KINDS.POST }],
  });

  if (!integration) {
    throw new Error('Integration not found');
  }

  const { facebookPageTokensMap = {} } = integration;

  const postDetail = await getPostDetails(
    pageId,
    facebookPageTokensMap,
    params.post_id || '',
  );

  if (!postDetail) {
    throw new Error(`Failed to fetch post details for post ${params.post_id}`);
  }

  return {
    postId: params.post_id,
    content: postDetail.message || '',
    recipientId: pageId,
    senderId: pageId,
    permalink_url: postDetail.permalink_url || '',
    timestamp: postDetail.created_time,
  };
}
