import type { IContext } from '~/connectionResolvers';
import { GraphQLError } from 'graphql';
import type {
  IMailMessageDocument,
  IMailSendArgs,
  TMailDeliveryStatus,
} from '@/integrations/mail/@types/message';
import type { IMailDraftEdit } from '@/integrations/mail/@types/draft';
import { createPermissionValidator } from '@/ticket/utils/permissionValidator';
import { checkMailConnection } from '@/integrations/mail/utils/connection';
import { publishMailDraftChanged } from '@/integrations/mail/utils/draftEvents';
import type { IPipelineMailSettings } from '@/integrations/mail/utils/pipeline';
import {
  connectPipelineMail,
  disconnectPipelineMail,
  markPipelineForwardVerified,
  updatePipelineMail,
} from '@/integrations/mail/utils/pipeline';
import {
  connectCloudflare,
  disconnectCloudflare,
} from '@/integrations/mail/utils/cloudflare/connect';
import { provisionCloudflare } from '@/integrations/mail/utils/cloudflare/provision';
import { toPublicConnection } from '@/integrations/mail/utils/cloudflare/serialize';
import { assertMailSenderAccess } from '@/integrations/mail/utils/senderAccess';
import { isDuplicateKeyError } from '@/integrations/mail/utils/mongoErrors';
import {
  MAIL_DELIVERY_STATUSES,
  MAIL_MESSAGE_TYPES,
} from '@/integrations/mail/constants';
import {
  isValidMailReactionEmoji,
  readInboundMailReaction,
} from '@/integrations/mail/utils/reactions';
import {
  assertMailConversationAccess,
  assertMailDraftAccess,
} from '@/integrations/mail/utils/access';

const toDeliveryOutcome = (message: IMailMessageDocument) => ({
  _id: message._id,
  deliveryStatus: message.deliveryStatus,
  deliveryError: message.deliveryError,
  bouncedRecipients: message.bouncedRecipients ?? [],
});

const assertMailReactionTarget = async (
  subdomain: string,
  target: IMailMessageDocument | null,
): Promise<{ message: IMailMessageDocument; recipient: string }> => {
  const recipient = target?.from[0]?.address?.trim();
  if (
    target &&
    (target.reactionEmoji ||
      (await readInboundMailReaction(subdomain, target.attachments)))
  ) {
    throw new Error("You can't react to an emoji reaction");
  }
  if (target?.hasReplyTo) {
    throw new Error("You can't react to a message with a reply-to address");
  }
  if (!target?.messageId || !recipient || target.senderMismatch) {
    throw new Error('This email cannot receive a reaction');
  }

  return { message: target, recipient };
};

export const mailMutations = {
  async mailCloudflareConnect(
    _root: undefined,
    args: { token: string; zoneId: string },
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicConnection(await connectCloudflare(subdomain, args));
  },

  async mailCloudflareProvision(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return toPublicConnection(await provisionCloudflare(subdomain));
  },

  async mailCloudflareDisconnect(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await disconnectCloudflare(subdomain);

    return true;
  },

  async mailSendMail(
    _root: undefined,
    args: IMailSendArgs,
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    if (!user?._id) {
      throw new Error('Authentication required');
    }

    let integrationId = args.integrationId;
    if (args.conversationId) {
      await assertMailConversationAccess({
        models,
        subdomain,
        user,
        conversationId: args.conversationId,
      });
      const conversation = await models.Conversations.findOne({
        _id: args.conversationId,
      });
      if (
        !conversation?.integrationId ||
        (integrationId && integrationId !== conversation.integrationId)
      ) {
        throw new Error('Mail conversation and sender do not match');
      }
      integrationId = conversation.integrationId;
    }

    if (!integrationId) {
      throw new Error('Starting an email conversation requires a sender');
    }

    await assertMailSenderAccess({ models, subdomain, user, integrationId });

    return toDeliveryOutcome(
      await models.MailMessages.createSendMail(
        { ...args, integrationId },
        subdomain,
      ),
    );
  },

  async mailSendReaction(
    _root: undefined,
    {
      conversationId,
      messageId,
      emoji,
    }: { conversationId: string; messageId: string; emoji: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');
    await assertMailConversationAccess({
      models,
      subdomain,
      user,
      conversationId,
    });

    if (!isValidMailReactionEmoji(emoji)) {
      throw new Error('Unsupported email reaction');
    }

    const { message: target, recipient } = await assertMailReactionTarget(
      subdomain,
      await models.MailMessages.findOne({
        _id: messageId,
        inboxConversationId: conversationId,
        type: MAIL_MESSAGE_TYPES.INBOX,
      }),
    );

    const conversation = await models.Conversations.findOne({
      _id: conversationId,
    });
    if (!conversation?.integrationId) {
      throw new Error('Mail conversation not found');
    }

    await assertMailSenderAccess({
      models,
      subdomain,
      user,
      integrationId: conversation.integrationId,
    });

    const reactionFilter = {
      inboxConversationId: conversationId,
      inboxIntegrationId: conversation.integrationId,
      type: MAIL_MESSAGE_TYPES.SENT,
      inReplyTo: target.messageId,
      reactionEmoji: emoji,
    };
    const activeDeliveryStatuses: TMailDeliveryStatus[] = [
      MAIL_DELIVERY_STATUSES.PENDING,
      MAIL_DELIVERY_STATUSES.SENT,
    ];
    const activeReactionFilter = {
      ...reactionFilter,
      deliveryStatus: {
        $in: activeDeliveryStatuses,
      },
    };
    const alreadyReacted = () =>
      new GraphQLError(`You've already reacted with ${emoji}`, {
        extensions: { code: 'MAIL_REACTION_ALREADY_SENT' },
      });
    if (await models.MailMessages.exists(activeReactionFilter)) {
      throw alreadyReacted();
    }
    const previousReaction = await models.MailMessages.findOne(
      reactionFilter,
    ).sort({ createdAt: -1, _id: -1 });
    const previousStatus = previousReaction?.deliveryStatus;
    if (previousStatus && activeDeliveryStatuses.includes(previousStatus)) {
      throw alreadyReacted();
    }
    if (previousReaction?.deliveryStatus === MAIL_DELIVERY_STATUSES.BOUNCED) {
      return toDeliveryOutcome(previousReaction);
    }
    const previousFailure =
      previousReaction?.deliveryStatus === MAIL_DELIVERY_STATUSES.FAILED
        ? previousReaction
        : null;
    const subject = target.subject?.trim() || 'Your email';
    const replySubject = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
    try {
      const message = previousFailure
        ? await models.MailMessages.retrySend(previousFailure._id, subdomain)
        : await models.MailMessages.createSendMail(
            {
              conversationId,
              integrationId: conversation.integrationId,
              subject: replySubject,
              body: `<p>${emoji}</p><p>Reacted to your email.</p>`,
              to: [recipient],
              replyToMessageId: target.messageId,
              references: [...(target.references ?? []), target.messageId],
              reactionEmoji: emoji,
            },
            subdomain,
          );
      return toDeliveryOutcome(message);
    } catch (error) {
      if (
        isDuplicateKeyError(error, '_id') ||
        (previousFailure &&
          (await models.MailMessages.exists(activeReactionFilter)))
      ) {
        throw alreadyReacted();
      }
      throw error;
    }
  },

  async mailPipelineConnect(
    _root: undefined,
    { pipelineId, ...settings }: { pipelineId: string } & IPipelineMailSettings,
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return connectPipelineMail({ models, subdomain, pipelineId, ...settings });
  },

  async mailPipelineUpdate(
    _root: undefined,
    { pipelineId, ...settings }: { pipelineId: string } & IPipelineMailSettings,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return updatePipelineMail(models, pipelineId, settings);
  },

  async mailPipelineForwardVerified(
    _root: undefined,
    { pipelineId }: { pipelineId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return markPipelineForwardVerified(models, pipelineId);
  },

  async mailPipelineDisconnect(
    _root: undefined,
    { pipelineId }: { pipelineId: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    await createPermissionValidator(models).validatePipelineAccess(
      pipelineId,
      user,
    );

    return disconnectPipelineMail(models, pipelineId);
  },

  async mailMessageRetry(
    _root: undefined,
    { _id }: { _id: string },
    { subdomain, models, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    return toDeliveryOutcome(
      await models.MailMessages.retrySend(_id, subdomain),
    );
  },

  async mailDraftSave(
    _root: undefined,
    { _id, ...doc }: IMailDraftEdit & { _id: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    await assertMailDraftAccess({ models, subdomain, user, draftId: _id });

    if (!doc.body?.trim()) {
      throw new Error('A draft needs a message before it can be saved');
    }

    const draft = await models.MailDrafts.saveDraft(_id, doc);

    await publishMailDraftChanged(subdomain, draft);

    return draft;
  },

  async mailDraftApprove(
    _root: undefined,
    { _id }: { _id: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    await assertMailDraftAccess({ models, subdomain, user, draftId: _id });

    const { draft, message } = await models.MailDrafts.approveDraft(
      _id,
      subdomain,
    );

    await publishMailDraftChanged(subdomain, draft);

    return { ...toDeliveryOutcome(message), draftId: draft._id };
  },

  async mailDraftRemove(
    _root: undefined,
    { _id }: { _id: string },
    { subdomain, models, user, checkPermission }: IContext,
  ) {
    await checkPermission('conversationMessageAdd');

    await assertMailDraftAccess({ models, subdomain, user, draftId: _id });

    const draft = await models.MailDrafts.removeDraft(_id);

    await publishMailDraftChanged(subdomain, draft);

    return draft;
  },

  async mailCheckConnection(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('integrationsEdit');

    return checkMailConnection(subdomain);
  },
};
