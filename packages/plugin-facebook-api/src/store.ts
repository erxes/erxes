import { ICommentParams, IPostParams } from './types';
import { debugError } from './debuggers';
import { getFileUploadConfigs, sendInboxMessage } from './messageBroker';
import {
  getFacebookUser,
  getFacebookUserProfilePic,
  getPostLink,
  uploadMedia
} from './utils';
import { IModels } from './connectionResolver';
import { INTEGRATION_KINDS } from './constants';

interface IDoc {
  postId?: string;
  commentId?: string;
  recipientId: string;
  senderId: string;
  content: string;
  parentId?: string;
  attachments?: string[];
  timestamp?: string | number;
  permalink_url?: '';
}

export const generatePostDoc = async (
  postParams: IPostParams,
  pageId: string,
  userId: string
) => {
  const {
    post_id,
    id,
    link,
    photos,
    created_time,
    message,
    photo_id,
    video_id
  } = postParams;
  let generatedMediaUrls: any[] = [];

  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs();

  const mediaUrls = postParams.photos || [];
  const mediaLink = postParams.link || '';

  if (UPLOAD_SERVICE_TYPE === 'AWS') {
    if (mediaLink) {
      if (video_id) {
        generatedMediaUrls = (await uploadMedia(mediaLink, true)) as any;
      }

      if (photo_id) {
        generatedMediaUrls = (await uploadMedia(mediaLink, false)) as any;
      }
    }

    if (mediaUrls.length > 0) {
      generatedMediaUrls = await Promise.all(
        mediaUrls.map(url => uploadMedia(url, false))
      );
    }
  }

  const doc: IDoc = {
    postId: post_id || id,
    content: message || '...',
    recipientId: pageId,
    senderId: userId,
    permalink_url: ''
  };

  if (link) {
    doc.attachments = generatedMediaUrls;
  }

  // Posted multiple image
  if (photos) {
    if (UPLOAD_SERVICE_TYPE === 'AWS') {
      doc.attachments = generatedMediaUrls;
    }
    if (UPLOAD_SERVICE_TYPE === 'local') {
      doc.attachments = photos;
    }
  }

  if (created_time) {
    doc.timestamp = created_time;
  }

  return doc;
};

const generateCommentDoc = (
  commentParams: ICommentParams,
  pageId: string,
  userId: string
) => {
  const {
    photo,
    video,
    post_id,
    parent_id,
    comment_id,
    created_time,
    message,
    restoredCommentCreatedAt,
    post
  } = commentParams;

  const doc: IDoc = {
    postId: post_id,
    commentId: comment_id,
    recipientId: pageId,
    senderId: userId,
    content: message || '...',
    permalink_url: ''
  };

  if (post_id !== parent_id) {
    doc.parentId = parent_id;
  }

  if (photo) {
    doc.attachments = [photo];
  }

  if (video) {
    doc.attachments = [video];
  }

  if (created_time) {
    doc.timestamp = (created_time * 1000).toString();
  }

  if (restoredCommentCreatedAt) {
    doc.timestamp = restoredCommentCreatedAt;
  }

  if (post && post.permalink_url) {
    doc.permalink_url = post.permalink_url;
  }

  return doc;
};

export const getOrCreatePost = async (
  models: IModels,
  subdomain: string,
  postParams: IPostParams,
  pageId: string,
  userId: string,
  customerErxesApiId: string
) => {
  let post = await models.Posts.findOne({ postId: postParams.post_id });

  const integration = await models.Integrations.getIntegration({
    $and: [
      { facebookPageIds: { $in: pageId } },
      { kind: INTEGRATION_KINDS.POST }
    ]
  });

  const { facebookPageTokensMap = {} } = integration;

  if (post) {
    return post;
  }

  const postUrl = await getPostLink(
    pageId,
    facebookPageTokensMap,
    postParams.post_id || ''
  );

  const doc = await generatePostDoc(postParams, pageId, userId);

  if (!doc.attachments && doc.content === '...') {
    throw new Error();
  }

  doc.permalink_url = postUrl;

  post = await models.Posts.create(doc);

  // create conversation in api
  try {
    const apiConversationResponse = await sendInboxMessage({
      subdomain,
      action: 'integrations.receive',
      data: {
        action: 'create-or-update-conversation',
        payload: JSON.stringify({
          customerId: customerErxesApiId,
          integrationId: integration.erxesApiId,
          content: post.content
        })
      },
      isRPC: true
    });

    post.erxesApiId = apiConversationResponse._id;
    await post.save();
  } catch (e) {
    await models.Posts.deleteOne({ _id: post._id });
    throw new Error(e);
  }

  return post;
};

export const getOrCreateComment = async (
  models: IModels,
  subdomain: string,
  commentParams: ICommentParams,
  pageId: string,
  userId: string,
  verb: string
) => {
  let comment = await models.Comments.findOne({
    commentId: commentParams.comment_id
  });

  const integration = await models.Integrations.getIntegration({
    $and: [
      { facebookPageIds: { $in: pageId } },
      { kind: INTEGRATION_KINDS.POST }
    ]
  });

  await models.Accounts.getAccount({ _id: integration.accountId });

  const doc = generateCommentDoc(commentParams, pageId, userId);

  if (verb && verb === 'edited') {
    await models.Comments.updateOne(
      { commentId: doc.commentId },
      { $set: { ...doc } }
    );
  }

  if (!comment) {
    comment = await models.Comments.create(doc);
  }

  const post = await models.Posts.findOne({ postId: comment.postId });

  if (post) {
    sendInboxMessage({
      subdomain,
      action: 'integrationsNotification',
      data: {
        action: 'external-integration-entry-added',
        conversationId: post.erxesApiId
      }
    });
  }
};

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  userId: string,
  kind: string
) => {
  const integration = await models.Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind }]
  });

  const { facebookPageTokensMap = {} } = integration;

  let customer = await models.Customers.findOne({ userId });

  if (customer) {
    return customer;
  }

  // create customer
  let fbUser = {} as any;

  try {
    fbUser =
      (await getFacebookUser(models, pageId, facebookPageTokensMap, userId)) ||
      {};
  } catch (e) {
    debugError(`Error during get customer info: ${e.message}`);
  }

  const fbUserProfilePic = await getFacebookUserProfilePic(
    pageId,
    facebookPageTokensMap,
    userId
  );

  // save on integrations db
  try {
    customer = await models.Customers.create({
      userId,
      firstName: fbUser.first_name || fbUser.name,
      lastName: fbUser.last_name,
      integrationId: integration.erxesApiId,
      profilePic: fbUserProfilePic
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
          firstName: fbUser.first_name || fbUser.name,
          lastName: fbUser.last_name,
          avatar: fbUserProfilePic,
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
