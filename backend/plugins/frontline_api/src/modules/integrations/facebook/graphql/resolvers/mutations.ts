import { IContext } from '~/connectionResolvers';
import {
  repairIntegrations,
  updateConfigs,
} from '@/integrations/facebook/helpers';
import { IReplyParams } from '@/integrations/facebook/@types/utils';
import { graphRequest, sendReply } from '@/integrations/facebook/utils';
import {
  facebookAccountSelector,
  resolveFacebookApp,
} from '@/integrations/facebook/commonUtils';
import {
  ICreatePostArgs,
  publishPagePost,
} from '@/integrations/facebook/postService';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { TCreateBotInputDoc } from '../../db/models/Bots';
export const facebookMutations = {
  async facebookConnectPageToken(
    _root,
    {
      pageAccessToken,
      integrationKind,
    }: { pageAccessToken: string; integrationKind: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    const token = pageAccessToken.trim();

    if (!token) {
      throw new Error('Page access token is required');
    }

    const page = (await graphRequest.get(
      '/me?fields=id,name,category',
      token,
    )) as { id?: string; name?: string; category?: string };

    if (!page.id || !page.name || !page.category) {
      throw new Error('The token must belong to a Facebook Page');
    }

    const app = await resolveFacebookApp(models, integrationKind);
    const selector = facebookAccountSelector(page.id, app);
    const accountData = {
      kind: 'facebook',
      token,
      scope: 'page_access_token',
      name: page.name,
      uid: page.id,
      appId: app.appId,
    };
    const existingAccount = await models.FacebookAccounts.findOne(selector);
    const account = existingAccount
      ? await models.FacebookAccounts.findByIdAndUpdate(
          existingAccount._id,
          { $set: accountData },
          { new: true },
        )
      : await models.FacebookAccounts.create(accountData);

    if (!account) {
      throw new Error('Failed to save the Facebook Page account');
    }

    return {
      account: { _id: account._id, name: account.name },
      page: { id: page.id, name: page.name },
    };
  },
  async facebookUpdateConfigs(
    _root,
    { configsMap },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

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

    if (comment?.comment_id) {
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
        inboxConversation?.integrationId ?? '',
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
  async facebookCreatePost(
    _root,
    args: ICreatePostArgs,
    { models, subdomain, user }: IContext,
  ) {
    return publishPagePost(models, subdomain, args, user?._id);
  },
  async facebookMessengerAddBot(_root, args, { models, user }: IContext) {
    return await models.FacebookBots.addBot(args, {
      userId: user._id,
    });
  },

  async facebookMessengerUpdateBot(
    _root,
    { _id, ...args }: TCreateBotInputDoc & { _id: string },
    { models, user }: IContext,
  ) {
    return await models.FacebookBots.updateBot(_id, args, {
      userId: user._id,
    });
  },

  async facebookMessengerRemoveBot(_root, { _id }, { models }: IContext) {
    return await models.FacebookBots.removeBot(_id);
  },
  async facebookMessengerRepairBot(_root, { _id }, { models, user }: IContext) {
    return await models.FacebookBots.repair(_id, {
      userId: user._id,
    });
  },
};
