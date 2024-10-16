import { ICommentParams, IPostParams } from './types';
import { debugError } from './debuggers';
import {
  getFileUploadConfigs,
  sendAutomationsMessage,
  sendInboxMessage
} from './messageBroker';
import {
  getFacebookUser,
  getFacebookUserProfilePic,
  getPostLink,
  uploadMedia
} from './utils';
import { IModels } from './connectionResolver';
import { INTEGRATION_KINDS } from './constants';
import { ICustomerDocument } from './models/definitions/customers';
import { IIntegrationDocument } from './models/Integrations';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';
import { getPostDetails } from './utils';
interface IDoc {
  postId?: string;
  commentId?: string;
  recipientId: string;
  customerId?: string;
  senderId: string;
  content: string;
  parentId?: string;
  attachments?: string[];
  timestamp?: string | number;
  permalink_url?: '';
}

export const generatePostDoc = async (
  postParams: any,
  pageId: string,
  userId: string,
  subdomain: string
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
  let generatedMediaUrls: string[] = [];

  const { UPLOAD_SERVICE_TYPE } = await getFileUploadConfigs(subdomain);

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
        photos.map((url) => uploadMedia(subdomain, url, false))
      );

      generatedMediaUrls = mediaUrls.filter(
        (url): url is string => url !== null && typeof url === 'string'
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
    timestamp: created_time ? new Date(created_time) : undefined
  };

  return doc;
};
const generateCommentDoc = (
  commentParams: ICommentParams,
  pageId: string,
  userId: string,
  customerId?: string
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
    permalink_url: '',
    customerId
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

export const getOrCreatePostConversation = async (
  models: IModels,
  pageId: string,
  subdomain: string,
  postId: string,
  integration: IIntegrationDocument,
  customer: ICustomerDocument,
  params: ICommentParams,
  postDetails: any
) => {
  try {
    let postConversation = await models.PostConversations.findOne({ postId });

    const mediaSources: string[] = getMediaSources(postDetails);
    const uploadedMediaUrls: string[] = [];
    const videoExtensions: string[] = ['.mp4', '.mov', '.avi'];

    if (mediaSources.length > 0) {
      for (const source of mediaSources) {
        try {
          const mediaType: boolean = videoExtensions.some((ext) =>
            source.includes(ext)
          );
          const mediaUrl: string | null = await uploadMedia(
            subdomain,
            source,
            mediaType
          );

          if (mediaUrl) {
            uploadedMediaUrls.push(mediaUrl);
          }
        } catch (error) {
          throw new Error(
            `Error uploading media from ${source}: ${error.message}`
          );
        }
      }
    }

    const {
      message = '...',
      permalink_url = '',
      created_time = ''
    } = postDetails || {};
    const facebookPostData = {
      postId,
      content: message,
      recipientId: pageId,
      senderId: pageId,
      permalink_url,
      timestamp: created_time,
      attachments: uploadedMediaUrls
    };

    if (!postConversation) {
      postConversation =
        await models.PostConversations.create(facebookPostData);
    } else if (uploadedMediaUrls.length > 0) {
      await models.PostConversations.updateMany(
        { postId },
        {
          $set: { ...facebookPostData }
        }
      );
      postConversation = await models.PostConversations.findOne({ postId });
    }

    return postConversation;
  } catch (error) {
    throw new Error(
      `Could not get or create post conversation. Details: ${error.message}`
    );
  }
};

export const getOrCreatePost = async (
  models: IModels,
  subdomain: string,
  postParams: IPostParams,
  pageId: string,
  userId: string,
  integration: IIntegrationDocument
) => {
  const { post_id, verb } = postParams;

  if (!post_id) {
    throw new Error('post_id is required');
  }

  const { facebookPageTokensMap = {} } = integration;

  const postUrl = await getPostLink(
    pageId,
    facebookPageTokensMap,
    postParams.post_id || ''
  );
  const doc = await generatePostDoc(postParams, pageId, userId, subdomain);
  if (!doc.attachments && doc.content === '...') {
    throw new Error();
  }

  doc.permalink_url = postUrl;
  if (verb == 'edited') {
    await models.PostConversations.updateMany(
      { postI: post_id },
      {
        $set: {
          ...doc
        }
      }
    );
  }
  let post = await models.PostConversations.findOne({
    postId: postParams.post_id
  });

  if (post) {
    return post;
  }
  post = await models.PostConversations.create(doc);

  return post;
};

export const getOrPostCreateComment = async (
  models: IModels,
  subdomain: string,
  commentParams: ICommentParams,
  pageId: string,
  userId: string,
  verb: string,
  integration: IIntegrationDocument,
  customer: ICustomerDocument
) => {
  if (verb === 'remove') {
    return;
  }
  const { facebookPageTokensMap = {} } = integration;
  const { comment_id, post_id, parent_id, message, photo } = commentParams;
  const postDetails = await getPostDetails(
    pageId,
    facebookPageTokensMap,
    post_id || ''
  );
  const content = postDetails?.message || '...';
  const attachment = postDetails?.attachments?.data || [];
  const existingPost = await models.PostConversations.findOne({
    postId: post_id
  });

  if (!existingPost || attachment.length > 0) {
    await getOrCreatePostConversation(
      models,
      pageId,
      subdomain,
      post_id,
      integration,
      customer,
      commentParams,
      postDetails
    );
  }
  if (existingPost?.content !== content) {
    await models.PostConversations.updateMany(
      { postId: post_id },
      {
        $set: {
          content: content
        }
      }
    );
  }
  const mainConversation = await models.CommentConversation.findOne({
    comment_id: comment_id
  });

  const parentConversation = await models.CommentConversation.findOne({
    comment_id: parent_id
  });

  const replyConversation = await models.CommentConversationReply.findOne({
    comment_id: comment_id
  });

  let attachments: any[] = [];
  if (photo) {
    attachments = [
      {
        name: 'Photo',
        url: photo,
        type: 'image'
      }
    ];
  }

  const doc = {
    attachments,
    recipientId: pageId,
    senderId: userId,
    createdAt: commentParams.post.updated_time,
    postId: post_id,
    comment_id: comment_id,
    content: message,
    customerId: customer.erxesApiId,
    parentId: parent_id
  };

  if (verb === 'edited') {
    if (mainConversation) {
      await models.CommentConversation.updateMany(
        { comment_id: comment_id },
        { $set: { content: doc.content } }
      );
    }
    if (replyConversation) {
      await models.CommentConversationReply.updateMany(
        { comment_id: comment_id },
        { $set: { content: doc.content } }
      );
    }
  }
  if (mainConversation || replyConversation) {
    return;
  }

  if (parentConversation) {
    await models.CommentConversationReply.create({ ...doc });
  } else {
    await models.CommentConversation.create({ ...doc });
  }

  let conversation = await models.CommentConversation.findOne({
    comment_id: comment_id
  });

  if (!conversation) {
    conversation = await models.CommentConversation.findOne({
      comment_id: parent_id
    });
  }

  if (!conversation) {
    throw new Error('Failed to find or create conversation');
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
          content: message,
          attachments,
          conversationId: conversation.erxesApiId
        })
      },
      isRPC: true
    });

    conversation.erxesApiId = apiConversationResponse?._id;
    await conversation.save();
  } catch (error) {
    await models.CommentConversation.deleteOne({ _id: conversation._id });
    throw new Error(error.message);
  }

  try {
    await sendInboxMessage({
      subdomain,
      action: 'conversationClientMessageInserted',
      data: {
        ...conversation.toObject(),
        conversationId: conversation.erxesApiId
      }
    });

    graphqlPubsub.publish(
      `conversationMessageInserted:${conversation.erxesApiId}`,
      {
        conversationMessageInserted: {
          ...conversation.toObject(),
          conversationId: conversation.erxesApiId
        }
      }
    );
  } catch {
    throw new Error(
      'Failed to update the database with the Erxes API response for this conversation.'
    );
  }

  const targetConversation = parentConversation
    ? await models.CommentConversationReply.findOne({
        comment_id: comment_id,
        parentId: parent_id
      })
    : conversation;

  if (!targetConversation) {
    throw new Error('Target conversation not found');
  }

  const targetObject = targetConversation.toObject();

  try {
    await sendAutomationsMessage({
      subdomain,
      action: 'trigger',
      data: {
        type: `facebook:comments`,
        targets: [
          {
            ...targetObject,
            postId: conversation.postId,
            erxesApiId: conversation.erxesApiId
          }
        ]
      },
      defaultValue: null
    });
  } catch (err) {
    debugError(err.message);
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

  const fbUserProfilePic: string | null = await getFacebookUserProfilePic(
    pageId,
    facebookPageTokensMap,
    userId,
    subdomain
  );

  let profile: string; // Declare profile as a string

  if (fbUserProfilePic) {
    profile = fbUserProfilePic; // Assign fbUserProfilePic to profile
  } else {
    profile = fbUser.profile_pic; // Assign fbUser.profile_pic to profile
  }
  // save on integrations db
  try {
    customer = await models.Customers.create({
      userId,
      firstName: fbUser.first_name || fbUser.name,
      lastName: fbUser.last_name,
      integrationId: integration.erxesApiId,
      profilePic: profile
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
          avatar: profile,
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

function getMediaSources(postDetails: any): string[] {
  const mediaSources: Set<string> = new Set();

  if (Array.isArray(postDetails?.attachments?.data)) {
    postDetails.attachments.data.forEach((attachment: any) => {
      const mediaType = attachment.media_type;

      if (mediaType === 'photo' && attachment.media?.image?.src) {
        mediaSources.add(attachment.media.image.src); // No need to append 'jpg'
      } else if (mediaType === 'video' && attachment.media?.source) {
        mediaSources.add(attachment.media.source); // No need to append 'mp'
      } else if (
        mediaType === 'album' &&
        Array.isArray(attachment.subattachments?.data)
      ) {
        attachment.subattachments.data.forEach((subattachment: any) => {
          if (subattachment.media) {
            if (
              subattachment.type === 'photo' &&
              subattachment.media?.image?.src
            ) {
              mediaSources.add(subattachment.media.image.src); // No need to append 'jpg'
            } else if (
              subattachment.type === 'video' &&
              subattachment.media?.source
            ) {
              mediaSources.add(subattachment.media.source); // No need to append 'mp'
            }
          }
        });
      }
    });
  } else {
    return [];
  }

  return Array.from(mediaSources);
}

//////
