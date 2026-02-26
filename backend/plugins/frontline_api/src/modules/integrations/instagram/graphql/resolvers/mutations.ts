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
    { models, user }: IContext,
  ) {
    const { commentId, content, attachments, conversationId } = params;

    const comment = await models.InstagramCommentConversation.findOne({
      commentId,
    });
    const post = await models.InstagramPostConversations.findOne({
      $or: [
        { erxesApiId: conversationId },
        { postId: comment ? comment.postId : '' },
      ],
    });
    if (!post) {
      throw new Error('Post not found');
    }

    const { recipientId } = post;

    let attachment: {
      url?: string;
      type?: string;
      payload?: { url: string };
    } = {};

    if (attachments && attachments.length > 0) {
      attachment = {
        type: 'file',
        payload: {
          url: attachments[0].url,
        },
      };
    }

    let data = {
      message: content,
      attachment_url: attachment.url,
    };

    const id = comment ? comment.comment_id : post.postId;

    if (comment && comment.comment_id) {
      data = {
        message: ` @[${comment.senderId}] ${content}`,
        attachment_url: attachment.url,
      };
    }

    try {
      const inboxConversation = await models.Conversations.findOne({
        _id: conversationId,
      });

      if (!inboxConversation) {
        throw new Error('conversation not found');
      }

      await sendReply(
        models,
        `${id}/comments`,
        data,
        inboxConversation?.integrationId || undefined,
      );

      await sendNotifications({
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
