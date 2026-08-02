import { IContext } from '~/connectionResolvers';
import {
  repairIntegrations,
  updateConfigs,
} from '@/integrations/facebook/helpers';
import { IReplyParams } from '@/integrations/facebook/@types/utils';
import {
  createPagePost,
  getPostDetails,
  graphRequest,
  sendReply,
  uploadUnpublishedPhoto,
} from '@/integrations/facebook/utils';
import { debugError } from '@/integrations/facebook/debuggers';
import {
  assertPostRateLimit,
  logPostAttempt,
} from '@/integrations/facebook/postGuard';
import { sendNotifications } from '@/inbox/graphql/resolvers/mutations/conversations';
import { TCreateBotInputDoc } from '../../db/models/Bots';
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
  // Publish a post to a connected Facebook page. The page token must carry
  // pages_manage_posts (granted at OAuth time via FACEBOOK_PERMISSIONS).
  async facebookCreatePost(
    _root,
    {
      erxesApiId,
      pageId,
      message,
      link,
      imageUrls,
    }: {
      erxesApiId: string;
      pageId: string;
      message: string;
      link?: string;
      imageUrls?: string[];
    },
    { models, subdomain, user }: IContext,
  ) {
    const integration = await models.FacebookIntegrations.findOne({
      erxesApiId,
    });

    if (!integration) {
      throw new Error('Integration not found');
    }

    if (!(integration.facebookPageIds || []).includes(pageId)) {
      throw new Error('Page is not connected to this integration');
    }

    const images = (imageUrls || []).map((u) => `${u}`.trim()).filter(Boolean);

    // Facebook rejects feed posts with more than 10 attached_media entries.
    if (images.length > 10) {
      throw new Error('A post can include at most 10 images');
    }

    for (const url of images) {
      if (!/^https:\/\//.test(url)) {
        throw new Error('Image URLs must be public https:// links');
      }
    }

    const userId = user?._id;

    // Bounds a runaway caller before it can get the shared Meta app flagged.
    try {
      await assertPostRateLimit(models, subdomain, pageId);
    } catch (e) {
      await logPostAttempt(models, {
        erxesApiId,
        pageId,
        message,
        userId,
        status: 'blocked',
        error: e.message,
      });

      throw e;
    }

    let response: { id: string };
    const stagedMediaIds: string[] = [];

    try {
      // Carousel flow: stage each image as an unpublished photo, then create
      // one feed post referencing them all. A failed upload aborts the post —
      // publishing a partial carousel would be worse than failing loudly.
      for (const url of images) {
        const uploaded = await uploadUnpublishedPhoto(
          pageId,
          integration.facebookPageTokensMap || {},
          url,
        );

        stagedMediaIds.push(uploaded.id);
      }

      response = await createPagePost(
        pageId,
        integration.facebookPageTokensMap || {},
        message,
        link,
        stagedMediaIds,
      );
    } catch (e) {
      // Best-effort cleanup so aborted carousels do not accumulate unpublished
      // photos in the page's library. Facebook garbage-collects these
      // eventually; this just does it promptly. Never masks the real error.
      const cleanupToken = (integration.facebookPageTokensMap || {})[pageId];

      for (const mediaId of stagedMediaIds) {
        try {
          await graphRequest.delete(mediaId, cleanupToken);
        } catch (cleanupError) {
          debugError(
            `Failed to clean up staged photo ${mediaId}: ${cleanupError.message}`,
          );
        }
      }

      await logPostAttempt(models, {
        erxesApiId,
        pageId,
        message,
        userId,
        status: 'failed',
        error: e.message,
      });

      throw e;
    }

    // The post IS published past this point. The permalink is a nicety — its
    // lookup must neither fail the mutation nor lose the audit record (a
    // thrown error here would make the user retry and double-post).
    let permalinkUrl: string | null = null;

    try {
      const details = await getPostDetails(
        pageId,
        integration.facebookPageTokensMap || {},
        response.id,
      );

      permalinkUrl = details ? details.permalink_url : null;
    } catch (e) {
      debugError(`Permalink lookup failed for ${response.id}: ${e.message}`);
    }

    await logPostAttempt(models, {
      erxesApiId,
      pageId,
      message,
      userId,
      status: 'published',
      postId: response.id,
      permalinkUrl,
    });

    return {
      postId: response.id,
      permalinkUrl,
    };
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
