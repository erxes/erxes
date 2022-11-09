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

const facebookMutations = {
  async facebookUpdateConfigs(_root, { configsMap }, { models }: IContext) {
    await updateConfigs(models, configsMap);

    return { status: 'ok' };
  },
  async facebookRepair(_root, { _id }: { _id: string }, { models }: IContext) {
    await repairIntegrations(models, _id);

    return 'success';
  },
  async facebookChangeCommentStatus(
    _root,
    params: ICommentStatusParams,
    { models }: IContext
  ) {
    const { commentId } = params;
    const comment = await models.Comments.findOne({ commentId });

    if (!comment) {
      throw new Error('Comment not found');
    }

    await models.Comments.updateOne(
      { commentId },
      { $set: { isResolved: comment.isResolved ? false : true } }
    );

    return models.Comments.findOne({ _id: comment._id });
  },

  async facebookReplyToComment(
    _root,
    params: IReplyParams,
    { models, subdomain, user }: IContext
  ) {
    const { commentId, content, attachments, conversationId } = params;

    const comment = await models.Comments.findOne({ commentId });

    const post = await models.Posts.findOne({
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

    const id = comment ? comment.commentId : post.postId;

    if (comment && comment.commentId) {
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
        recipientId,
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
  }
};

export default facebookMutations;
