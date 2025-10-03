import { IContext } from '~/connectionResolvers';
import {
  repairIntegrations,
  updateConfigs,
} from '@/integrations/facebook/helpers';
import { IReplyParams } from '@/integrations/facebook/@types/utils';
import { sendReply } from '@/integrations/facebook/utils';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
export const facebookMutations = {
  async facebookUpdateConfigs(_root, { configsMap }, { subdomain }: IContext) {
    await updateConfigs(subdomain, configsMap);

    return { status: 'ok' };
  },
  async facebookRepair(
    _root,
    { _id }: { _id: string },
    { subdomain }: IContext,
  ) {
    await repairIntegrations(subdomain, _id);

    return 'success';
  },

  async facebookReplyToComment(
    _root,
    params: IReplyParams,
    { models, user, subdomain }: IContext,
  ) {
    const { commentId, content, attachments, conversationId } = params;

    const comment = await models.FacebookCommentConversation.findOne({
      comment_id: commentId,
    });

    const post = await models.FacebookPostConversations.findOne({
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
        recipientId,
        (inboxConversation && inboxConversation.integrationId) || '',
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
};
