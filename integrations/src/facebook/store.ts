import { Comments, Customers, Posts } from './models';
import { ICommentParams, IPostParams } from './types';

import { sendMessage, sendRPCMessage } from '../messageBroker';
import { Accounts, Integrations } from '../models';
import {
  getFacebookUser,
  getFacebookUserProfilePic,
  getPostLink,
  refreshPageAccesToken
} from './utils';

export const generatePostDoc = (
  postParams: IPostParams,
  pageId: string,
  userId: string
) => {
  const { post_id, id, link, photos, created_time, message } = postParams;

  const doc = {
    postId: post_id || id,
    content: message || '...',
    recipientId: pageId,
    senderId: userId,
    attachments: null,
    timestamp: null,
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

  const doc = {
    postId: post_id,
    commentId: comment_id,
    recipientId: pageId,
    senderId: userId,
    content: message || '...',
    parentId: null,
    attachments: null,
    timestamp: null,
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
  postParams: IPostParams,
  pageId: string,
  userId: string,
  customerErxesApiId: string
) => {
  let post = await Posts.findOne({ postId: postParams.post_id });

  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }]
  });

  const { facebookPageTokensMap } = integration;

  if (post) {
    return post;
  }

  const postUrl = await getPostLink(
    pageId,
    facebookPageTokensMap,
    postParams.post_id
  );

  const doc = generatePostDoc(postParams, pageId, userId);

  if (!doc.attachments && doc.content === '...') {
    throw new Error();
  }

  doc.permalink_url = postUrl;

  post = await Posts.create(doc);

  // create conversation in api
  try {
    const apiConversationResponse = await sendRPCMessage({
      action: 'create-or-update-conversation',
      payload: JSON.stringify({
        customerId: customerErxesApiId,
        integrationId: integration.erxesApiId,
        content: post.content
      })
    });

    post.erxesApiId = apiConversationResponse._id;
    await post.save();
  } catch (e) {
    await Posts.deleteOne({ _id: post._id });
    throw new Error(e);
  }

  return post;
};

export const getOrCreateComment = async (
  commentParams: ICommentParams,
  pageId: string,
  userId: string,
  verb: string
) => {
  const comment = await Comments.findOne({
    commentId: commentParams.comment_id
  });

  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }]
  });

  Accounts.getAccount({ _id: integration.accountId });

  const doc = generateCommentDoc(commentParams, pageId, userId);

  if (verb && verb === 'edited') {
    await Comments.updateOne(
      { commentId: doc.commentId },
      { $set: { ...doc } }
    );

    return sendMessage({ action: 'external-integration-entry-added' });
  }

  if (comment) {
    return comment;
  }

  await Comments.create(doc);

  sendMessage({ action: 'external-integration-entry-added' });
};

export const getOrCreateCustomer = async (
  pageId: string,
  userId: string,
  kind: string
) => {
  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind }]
  });

  let { facebookPageTokensMap } = integration;

  let customer = await Customers.findOne({ userId });

  if (customer) {
    return customer;
  }

  // create customer
  let fbUser = {} as any;

  try {
    fbUser =
      (await getFacebookUser(pageId, facebookPageTokensMap, userId)) || {};
  } catch (e) {
    facebookPageTokensMap = await refreshPageAccesToken(pageId, integration);
    if (e.message.includes('access token')) {
      fbUser =
        (await getFacebookUser(pageId, facebookPageTokensMap, userId)) || {};
    }
  }

  const fbUserProfilePic =
    fbUser.profile_pic ||
    (await getFacebookUserProfilePic(pageId, facebookPageTokensMap, userId));

  // save on integrations db
  try {
    customer = await Customers.create({
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
    const apiCustomerResponse = await sendRPCMessage({
      action: 'get-create-update-customer',
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: fbUser.first_name || fbUser.name,
        lastName: fbUser.last_name,
        avatar: fbUserProfilePic,
        isUser: true
      })
    });

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }

  return customer;
};
