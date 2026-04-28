import { IReplyParams } from '@/integrations/instagram/@types/utils';
import { IContext } from '~/connectionResolvers';
import {
  repairIntegrations,
  updateConfigs,
} from '@/integrations/instagram/helpers';
import { sendReply } from '@/integrations/instagram/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';

export const instagramMutations = {
  async instagramUpdateConfigs(_root, { configsMap }, { subdomain }: IContext) {
    await updateConfigs(subdomain, configsMap);

    return { status: 'ok' };
  },
  async instagramRepair(
    _root,
    { _id }: { _id: string },
    { subdomain }: IContext,
  ) {
    await repairIntegrations(subdomain, _id);

    return 'success';
  },

  async instagramReplyToComment(
    _root,
    params: IReplyParams,
    { models, user, subdomain }: IContext,
  ) {
    const { content, attachments, conversationId } = params;
    let { commentId } = params;

    // Auto-resolve commentId from the inbox conversation's linked comment
    if (!commentId && conversationId) {
      const commentConv = await models.InstagramCommentConversation.findOne({
        erxesApiId: conversationId,
      });
      if (commentConv) {
        commentId = commentConv.comment_id;
      }
    }

    const comment = commentId
      ? await models.InstagramCommentConversation.findOne({
          comment_id: commentId,
        })
      : null;

    const post = await models.InstagramPostConversations.findOne({
      postId: comment ? comment.postId : undefined,
    });

    if (!post) {
      throw new Error('Post not found');
    }

    let attachment: {
      url?: string;
      type?: string;
      payload?: { url: string };
    } = {};

    if (attachments && attachments.length > 0) {
      attachment = {
        type: 'file',
        payload: { url: attachments[0].url },
      };
    }

    const id = comment ? comment.comment_id : post.postId;

    const data = comment
      ? {
          message: `@${comment.senderId} ${content}`,
          attachment_url: attachment.payload?.url,
        }
      : {
          message: content,
          attachment_url: attachment.url,
        };

    try {
      const inboxConversation = await models.Conversations.findOne({
        _id: conversationId,
      });

      if (!inboxConversation) {
        throw new Error('Conversation not found');
      }

      await sendReply(
        models,
        `${id}/comments`,
        data,
        inboxConversation.integrationId || undefined,
      );

      await sendNotifications(subdomain, {
        user,
        conversations: [inboxConversation],
        type: 'conversationStateChange',
        mobile: true,
        messageContent: content,
      });

      return { status: 'success' };
    } catch (e) {
      throw new Error(e.message);
    }
  },

  async instagramResolveComment(
    _root,
    { _id, isResolved }: { _id: string; isResolved: boolean },
    { models }: IContext,
  ) {
    await models.InstagramCommentConversation.updateOne(
      { _id },
      { $set: { isResolved } },
    );
    return { status: 'ok' };
  },
  async instagramMessengerAddBot(_root, args, { models }: IContext) {
    return await models.InstagramBots.addBot(args);
  },

  async instagramMessengerUpdateBot(
    _root,
    { _id, ...args },
    { models }: IContext,
  ) {
    return await models.InstagramBots.updateBot(_id, args);
  },

  async instagramMessengerRemoveBot(_root, { _id }, { models }: IContext) {
    return await models.InstagramBots.removeBot(_id);
  },
  async instagramMessengerRepairBot(_root, { _id }, { models }: IContext) {
    return await models.InstagramBots.repair(_id);
  },
};

export default instagramMutations;
