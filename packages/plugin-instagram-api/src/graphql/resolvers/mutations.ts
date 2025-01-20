import { IContext } from '../../connectionResolver';
import { repairIntegrations, updateConfigs } from '../../helpers';
import { sendInboxMessage } from '../../messageBroker';
import { sendReply } from '../../utils';

interface ICommentStatusParams {
  commentId: string;
}

interface IReplyParams extends ICommentStatusParams {
  conversationId: string;
  content: string;
  attachments: any;
}

const instagramMutations = {
  async instagramUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },
  async instagramRepair(
    _root,
    { _id }: { _id: string },
    { subdomain, models }: IContext
  ) {
    await repairIntegrations(subdomain, models, _id);

    return 'success';
  },

  async instagramChangeCommentStatus(
    _root,
    params: ICommentStatusParams,
    { models }: IContext
  ) {
    const { commentId } = params;
    const comment = await models.CommentConversation.findOne({ commentId });

    if (!comment) {
      throw new Error('Comment not found');
    }

    await models.CommentConversation.updateOne(
      { commentId },
      { $set: { isResolved: !comment.isResolved } }
    );

    return models.CommentConversation.findOne({ _id: comment._id });
  },

  async instagramReplyToComment(
    _root,
    params: IReplyParams,
    { models, subdomain, user }: IContext
  ) {
    const { commentId, content, attachments, conversationId } = params;

    const comment = await models.CommentConversation.findOne({ commentId });
    const post = await models.PostConversations.findOne({
      $or: [
        { erxesApiId: conversationId },
        { postId: comment ? comment.postId : '' }
      ]
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
          url: attachments[0].url
        }
      };
    }

    let data = {
      message: content,
      attachment_url: attachment.url
    };

    const id = comment ? comment.comment_id : post.postId;

    if (comment && comment.comment_id) {
      data = {
        message: ` @[${comment.senderId}] ${content}`,
        attachment_url: attachment.url
      };
    }

    try {
      const inboxConversation = await sendInboxMessage({
        isRPC: true,
        subdomain,
        action: 'conversations.findOne',
        data: { query: { _id: conversationId } }
      });
   
      await sendReply(
        models,
        `${id}/comments`,
        data,
        inboxConversation && inboxConversation.integrationId
      );

      sendInboxMessage({
        action: 'sendNotifications',
        isRPC: false,
        subdomain,
        data: {
          user,
          conversations: [inboxConversation],
          type: 'conversationStateChange',
          mobile: true,
          messageContent: content
        }
      });

      return { status: 'success' };
    } catch (e) {
      throw new Error(e.message);
    }
  },
    async instagramMessengerAddBot(_root, args, { models }: IContext) {
    return await models.Bots.addBot(args);
  },

  async instagramMessengerUpdateBot(
    _root,
    { _id, ...args },
    { models }: IContext,
  ) {
    return await models.Bots.updateBot(_id, args);
  },

  async instagramMessengerRemoveBot(_root, { _id }, { models }: IContext) {
    return await models.Bots.removeBot(_id);
  },
  async instagramMessengerRepairBot(_root, { _id }, { models }: IContext) {
    return await models.Bots.repair(_id);
  },
};

export default instagramMutations;
