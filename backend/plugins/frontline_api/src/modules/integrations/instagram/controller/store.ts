import { debugError } from '../debuggers';
// import { sendInboxMessage, sendAutomationsMessage } from "./messageBroker";
import { getInstagramUser, getPostLink } from '../utils';
import { IModels } from '~/connectionResolvers'
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { IInstagramCustomerDocument } from '@/integrations/instagram/@types/customers';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { INTEGRATION_KINDS } from "../constants";
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';

export const getOrCreateCustomer = async (
  models: IModels,
  subdomain: string,
  pageId: string,
  userId: string,
  facebookPageId: string | undefined,
  kind: string,
  facebookPageTokensMap?: { [key: string]: string }
) => {
  const integration = await models.InstagramIntegrations.findOne({
    $and: [{ instagramPageId: { $in: pageId } }, { kind }]
  });

  if (!integration) {
    throw new Error("Instagram Integration not found");
  }

  let customer = await models.InstagramCustomers.findOne({ userId });
  if (customer) {
    return customer;
  }

  // Create customer
  let instagramUser = {} as {
    name: string;
    username: string;
    profile_pic: string;
    id: string;
  };
  let firstName;

  try {
    instagramUser = await getInstagramUser(
      userId,
      facebookPageId || "",
      facebookPageTokensMap
    );
    if (instagramUser) {
      firstName = instagramUser.username || instagramUser.name;
    }
  } catch (e: any) {
    debugError(`Error during get customer info: ${e.message}`);
  }

  if (!firstName) {
    throw new Error('Unable to retrieve customer information from Instagram');
  }

  // Save in integrations DB
  try {
    customer = await models.InstagramCustomers.create({
      userId,
      firstName,
      integrationId: integration.erxesApiId,
      profilePic: instagramUser.profile_pic
    });
  } catch (e: any) {
    if (e.message?.includes("duplicate")) {
      throw new Error("Concurrent request: customer duplication");
    }
    throw e; // Preserve stack trace
  }

  // Save in core API (via receiveInboxMessage)
  try {
    const data = {
      action: "get-create-update-customer",
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: firstName,
        avatar: instagramUser.profile_pic,
        isUser: true
      })
    };

    const apiCustomerResponse = await receiveInboxMessage(subdomain, data);

    if (apiCustomerResponse.status === 'success') {
      customer.erxesApiId = apiCustomerResponse.data._id;
      await customer.save();
    } else {
      throw new Error(
        `Customer creation failed: ${JSON.stringify(apiCustomerResponse)}`
      );
    }
  } catch (e: any) {
    await models.InstagramCustomers.deleteOne({ _id: customer._id });
    // Re-throw with added context, preserving original stack
    throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
  }

  return customer;
};

export const getOrCreateComment = async (
  models: IModels,
  subdomain: string,
  postConversation: any,
  commentParams: any,
  pageId: string,
  userId: string,
  integration: IInstagramIntegrationDocument,
  customer: IInstagramCustomerDocument
) => {
  const { parent_id, id, text } = commentParams;
  const post_id = commentParams.media.id;

  const mainConversation = await models.InstagramCommentConversation.findOne({
    comment_id: id
  });

  const parentConversation = await models.InstagramCommentConversation.findOne({
    comment_id: commentParams.parent_id
  });

  const replyConversation = await models.InstagramCommentConversationReply.findOne({
    comment_id: id
  });

  if (mainConversation || replyConversation) {
    return;
  }

  const post = await models.InstagramPostConversations.findOne({
    postId: post_id
  });

  if (!post) {
    throw new Error("Post not found");
  }

  let attachments: any[] = [];
  if (commentParams.photo) {
    attachments = [
      {
        name: "Photo",
        url: commentParams.photo,
        type: "image"
      }
    ];
  }

  const doc = {
    attachments,
    recipientId: pageId,
    senderId: userId,
    postId: post_id,
    comment_id: id,
    content: text,
    customerId: customer.erxesApiId,
    parentId: parent_id
  };

  if (parentConversation) {
    await models.InstagramCommentConversationReply.create({ ...doc });
  } else {
    await models.InstagramCommentConversation.create({ ...doc });
  }

  let conversation = await models.InstagramCommentConversation.findOne({
    comment_id: id
  });

  if (!conversation) {
    conversation = await models.InstagramCommentConversation.findOne({
      comment_id: commentParams.parent_id
    });
  }

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  try {
    const data = {
      action: "create-or-update-conversation",
      payload: JSON.stringify({
        customerId: customer.erxesApiId,
        integrationId: integration.erxesApiId,
        content: text,
        attachments,
        conversationId: conversation.erxesApiId
      })
    };

    const apiConversationResponse = await receiveInboxMessage(subdomain, data);

    if (apiConversationResponse.status === 'success') {
      conversation.erxesApiId = apiConversationResponse.data._id;
      await conversation.save();
    } else {
      throw new Error(
        `Conversation creation failed: ${JSON.stringify(apiConversationResponse)}`
      );
    }
  } catch (error: any) {
    await models.InstagramCommentConversation.deleteOne({
      _id: conversation?._id
    });
    throw new Error(error.message);
  }

  try {
    const conversationObj = conversation.toObject();
    const doc = {
      ...conversationObj,
      _id: conversationObj._id.toString(),
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

//   used with messagebroker
//   if (conversation) {
//     await sendAutomationsMessage({
//       subdomain,
//       action: "trigger",
//       data: {
//         type: `instagram:comments`,
//         targets: [conversation?.toObject()]
//       },
//       defaultValue: null
//     }).catch((err) => debugError(err.message));
//   }
};

export const getOrCreatePostConversation = async (
  models: IModels,
  pageId: string,
  subdomain: string,
  postId: string,
  integration: IInstagramIntegrationDocument,
  customer: IInstagramCustomerDocument,
  params: any
) => {
  try {
    let postConversation = await models.InstagramPostConversations.findOne({
      postId
    });

    if (!postConversation) {
      const integration = await models.InstagramIntegrations.findOne({
        instagramPageId: { $in: pageId }
      });

      if (!integration) {
        throw new Error("Integration not found");
      }

      const { accountId } = integration;
      const account = await models.InstagramAccounts.findOne({ _id: accountId });

      if (!account) {
        throw new Error("Account not found");
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

      postConversation = await models.InstagramPostConversations.create(instagramPost);
      return postConversation;
    } else {
      // Check if content has changed
      const account = await models.InstagramAccounts.findOne({ 
        _id: integration.accountId 
      });

      if (!account) {
        return postConversation;
      }

      const getPostDetail = await getPostLink(account.token, postId);
      const hasPostContentChanged = 
        getPostDetail.caption !== postConversation.content;

      if (hasPostContentChanged) {
        await models.InstagramPostConversations.updateOne(
          { postId },
          { $set: { content: getPostDetail.caption } }
        );
        const updatedPost = await models.InstagramPostConversations.findOne({
          postId
        });
        return updatedPost;
      } else {
        return postConversation;
      }
    }
  } catch (error: any) {
    throw new Error(
      `Failed to get or create post conversation: ${error.message}`
    );
  }
};

export const customerCreated = async (
  userId: string,
  firstName: string,
  integrationId: any,
  profilePic: any,
  subdomain: any,
  models: IModels,
  customer: any,
  integration: any
) => {
  // Save in integrations DB
  try {
    customer = await models.InstagramCustomers.create({
      userId,
      firstName: firstName,
      integrationId: integrationId,
      profilePic: profilePic
    });
  } catch (e: any) {
    if (e.message?.includes("duplicate")) {
      throw new Error("Concurrent request: customer duplication");
    }
    throw e; // Preserve stack trace
  }

  // Save in core API (via receiveInboxMessage)
  try {
    const data = {
      action: "get-create-update-customer",
      payload: JSON.stringify({
        integrationId: integration.erxesApiId,
        firstName: firstName,
        avatar: profilePic,
        isUser: true
      })
    };

    const apiCustomerResponse = await receiveInboxMessage(subdomain, data);

    if (apiCustomerResponse.status === 'success') {
      customer.erxesApiId = apiCustomerResponse.data._id;
      await customer.save();
    } else {
      throw new Error(
        `Customer creation failed: ${JSON.stringify(apiCustomerResponse)}`
      );
    }
  } catch (e: any) {
    // Delete the customer if saving to the API fails
    await models.InstagramCustomers.deleteOne({ _id: customer._id });
    // Re-throw with added context, preserving original stack
    throw new Error(`Failed to sync with API: ${e.stack || e.message || e}`);
  }
};