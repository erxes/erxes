import { ICommentParams, IPostParams } from './types';

import { debugError } from '../debuggers';
import { sendInboxMessage } from '../messageBroker';
import {
  getFacebookUser,
  getFacebookUserProfilePic,
  getPostLink
} from './utils';
import { IModels } from '../connectionResolver';

interface IDoc {
  postId?: string,
  commentId?: string,
  recipientId: string,
  senderId: string,
  content: string,
  parentId?: string,
  attachments?: string[],
  timestamp?: string | number,
  permalink_url?: ''
}

export const generatePostDoc = (
  postParams: IPostParams,
  pageId: string,
  userId: string
) => {
  const { post_id, id, link, photos, created_time, message } = postParams;
  
  const doc: IDoc = {
    postId: post_id || id,
    content: message || '...',
    recipientId: pageId,
    senderId: userId,
    permalink_url: ''
  };

  if (link) {
    doc.attachments = [link];
  }

  // Posted multiple image
  if (photos) {
    doc.attachments = photos;
  }

  if (created_time) {
    doc.timestamp = created_time;
  }

  return doc;
};

export const generateCommentDoc = (
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
  let post = await models.FbPosts.findOne({ postId: postParams.post_id });

  const integration = await models.Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }]
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

  const doc = generatePostDoc(postParams, pageId, userId);

  if (!doc.attachments && doc.content === '...') {
    throw new Error();
  }

  doc.permalink_url = postUrl;

  post = await models.FbPosts.create(doc);

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
    await models.FbPosts.deleteOne({ _id: post._id });
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
  const comment = await models.FbComments.findOne({
    commentId: commentParams.comment_id
  });

  const integration = await models.Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }]
  });

  models.Accounts.getAccount({ _id: integration.accountId });

  const doc = generateCommentDoc(commentParams, pageId, userId);

  if (verb && verb === 'edited') {
    await models.FbComments.updateOne(
      { commentId: doc.commentId },
      { $set: { ...doc } }
    );

    return sendInboxMessage({
      subdomain,
      action: 'integrationsNotification',
      data: {
        action: 'external-integration-entry-added'
      }
    });
  }

  if (comment) {
    return comment;
  }

  await models.FbComments.create(doc);

  sendInboxMessage({
    subdomain,
    action: 'integrationsNotification',
    data: {
      action: 'external-integration-entry-added'
    }
  });
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

  let customer = await models.FbCustomers.findOne({ userId });

  if (customer) {
    return customer;
  }

  // create customer
  let fbUser = {} as any;

  try {
    fbUser =
      (await getFacebookUser(models, pageId, facebookPageTokensMap, userId)) || {};
  } catch (e) {
    debugError(`Error during get customer info: ${e.message}`);
  }

  const fbUserProfilePic =
    fbUser.profile_pic ||
    (await getFacebookUserProfilePic(pageId, facebookPageTokensMap, userId));

  // save on integrations db
  try {
    customer = await models.FbCustomers.create({
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
    await models.FbCustomers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }

  return customer;
};
