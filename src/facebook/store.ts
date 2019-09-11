import { Comments, Customers, Posts } from './models';
import { ICommentParams, IPostParams } from './types';

import { Accounts, Integrations } from '../models';
import { fetchMainApi } from '../utils';
import { getFacebookUser, getFacebookUserProfilePic } from './utils';

export const generatePostDoc = (postParams: IPostParams, pageId: string, userId: string) => {
  const { post_id, id, video_id, link, photo_id, photos, created_time, message } = postParams;

  const doc = {
    postId: post_id || id,
    content: message || '...',
    recipientId: pageId,
    senderId: userId,
    attachments: null,
    timestamp: null,
  };

  if (link) {
    // Posted video
    if (video_id) {
      doc.attachments = [link];

      // Posted photo
    } else if (photo_id) {
      doc.attachments = [link];
    } else {
      doc.attachments = [link];
    }
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

export const generateCommentDoc = (commentParams: ICommentParams, pageId: string, userId: string) => {
  const { photo, video, post_id, parent_id, comment_id, created_time, message } = commentParams;

  const doc = {
    postId: post_id,
    commentId: comment_id,
    recipientId: pageId,
    senderId: userId,
    content: message || '...',
    parentId: null,
    attachments: null,
    timestamp: null,
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
    doc.timestamp = created_time;
  }

  return doc;
};

export const getOrCreatePost = async (
  postParams: IPostParams,
  pageId: string,
  userId: string,
  customerErxesApiId: string,
) => {
  let post = await Posts.findOne({ postId: postParams.post_id });

  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }],
  });

  if (post) {
    return post;
  }

  const doc = generatePostDoc(postParams, pageId, userId);

  post = await Posts.create(doc);

  // create conversation in api
  try {
    const apiConversationResponse = await fetchMainApi({
      path: '/integrations-api',
      method: 'POST',
      body: {
        action: 'create-conversation',
        payload: JSON.stringify({
          customerId: customerErxesApiId,
          integrationId: integration.erxesApiId,
          content: post.content,
        }),
      },
    });

    post.erxesApiId = apiConversationResponse._id;
    await post.save();
  } catch (e) {
    await Posts.deleteOne({ _id: post._id });
    throw new Error(e);
  }

  return post;
};

export const getOrCreateComment = async (commentParams: ICommentParams, pageId: string, userId: string) => {
  const comment = await Comments.findOne({ commentId: commentParams.comment_id });

  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }],
  });

  Accounts.getAccount({ _id: integration.accountId });

  if (comment) {
    return comment;
  }

  const doc = generateCommentDoc(commentParams, pageId, userId);

  await Comments.create(doc);

  try {
    fetchMainApi({
      path: '/integrations-api',
      method: 'POST',
      body: {
        action: 'external-integration-entry-added',
      },
    });
  } catch (e) {
    throw new Error(e);
  }
};

export const getOrCreateCustomer = async (pageId: string, userId: string) => {
  const integration = await Integrations.getIntegration({
    $and: [{ facebookPageIds: { $in: pageId } }, { kind: 'facebook-post' }],
  });

  const account = await Accounts.getAccount({ _id: integration.accountId });

  let customer = await Customers.findOne({ userId });

  if (customer) {
    return customer;
  }
  // create customer
  const fbUser = await getFacebookUser(pageId, userId, account.token);

  // save on integrations db
  try {
    customer = await Customers.create({
      userId,
      firstName: fbUser.first_name || fbUser.name,
      lastName: fbUser.last_name,
      integrationId: integration.erxesApiId,
      profilePic: fbUser.profile_pic || (await getFacebookUserProfilePic(userId)),
    });
  } catch (e) {
    throw new Error(e.message.includes('duplicate') ? 'Concurrent request: customer duplication' : e);
  }

  // save on api
  try {
    const apiCustomerResponse = await fetchMainApi({
      path: '/integrations-api',
      method: 'POST',
      body: {
        action: 'create-or-update-customer',
        payload: JSON.stringify({
          integrationId: integration.erxesApiId,
          firstName: fbUser.first_name || fbUser.name,
          lastName: fbUser.last_name,
          avatar: fbUser.profile_pic || (await getFacebookUserProfilePic(userId)),
          isUser: true,
        }),
      },
    });

    customer.erxesApiId = apiCustomerResponse._id;
    await customer.save();
  } catch (e) {
    await Customers.deleteOne({ _id: customer._id });
    throw new Error(e);
  }

  return customer;
};
