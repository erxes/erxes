import type { IContext } from '~/connectionResolvers';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { assertViberIntegrationAccess } from '@/integrations/viber/access';
import {
  dispatchViberOutbox,
  getViberMessageStatus,
  sendViberReply,
} from '@/integrations/viber/outbound';
import type { IViberReplyInput } from '@/integrations/viber/outbound';
import { getViberAccountInfo } from '@/integrations/viber/utils/account';
import { registerViberWebhook } from '@/integrations/viber/helpers';
import { getViberSetup, getViberConversationState } from '../readiness';
import { getViberWebhookUrl } from '../config';
import { getViberMediaSettings, updateViberMediaSettings } from '../settings';
import { viberSetupIncomplete } from '../setupError';

export const viberQueries = {
  viberMediaSettings(_root: unknown, _args: unknown, context: IContext) {
    return getViberMediaSettings(context);
  },
  viberSetup(_root: unknown, _args: unknown, context: IContext) {
    return getViberSetup(context);
  },
  viberConversationState(
    _root: unknown,
    { conversationId }: { conversationId: string },
    context: IContext,
  ) {
    return getViberConversationState(context, conversationId);
  },
  async viberConnection(
    _root: unknown,
    { integrationId }: { integrationId: string },
    context: IContext,
  ) {
    await assertViberIntegrationAccess(
      context,
      integrationId,
      'showIntegrations',
    );
    const connection = await context.models.ViberIntegrations.findOne({
      inboxId: integrationId,
    }).select('inboxId botId name healthStatus error');
    return connection
      ? {
          integrationId: connection.inboxId,
          botId: connection.botId,
          name: connection.name,
          healthStatus: connection.healthStatus ?? 'pending',
          error: connection.error,
        }
      : null;
  },
  viberMessageStatus(
    _root: unknown,
    { messageId }: { messageId: string },
    context: IContext,
  ) {
    return getViberMessageStatus(context, messageId);
  },
};

export const viberMutations = {
  viberUpdateMediaSettings(
    _root: unknown,
    { hostnames }: { hostnames?: string[] | null },
    context: IContext,
  ) {
    return updateViberMediaSettings(context, hostnames ?? null);
  },
  viberSendMessage(
    _root: unknown,
    input: Omit<IViberReplyInput, 'structured'> & { message?: unknown },
    context: IContext,
  ) {
    return sendViberReply(context, { ...input, structured: input.message });
  },
  async viberRetryMessage(
    _root: unknown,
    { messageId }: { messageId: string },
    context: IContext,
  ) {
    await dispatchViberOutbox(context, messageId);
    return context.models.ConversationMessages.getMessage(messageId);
  },
  async viberUpdateToken(
    _root: unknown,
    { integrationId, token }: { integrationId: string; token: string },
    context: IContext,
  ): Promise<boolean> {
    await assertViberIntegrationAccess(
      context,
      integrationId,
      'integrationsEdit',
    );
    const connection = await context.models.ViberIntegrations.findOne({
      inboxId: integrationId,
    });
    if (!connection) throw new Error('Viber connection not found');
    const account = await getViberAccountInfo(token);
    if (account.id !== connection.botId)
      throw new Error(
        'This token belongs to another Viber bot. Create a separate integration to keep customer mappings isolated.',
      );
    const result = await context.models.ViberIntegrations.updateOne(
      { _id: connection._id, inboxId: integrationId, botId: account.id },
      {
        $set: { token, name: account.name, healthStatus: 'pending', error: '' },
      },
      { runValidators: true },
    );
    if (result.matchedCount !== 1)
      throw new Error('Viber connection no longer exists');
    try {
      await registerViberWebhook(context.subdomain, integrationId);
    } catch {
      throw viberSetupIncomplete(integrationId);
    }
    return true;
  },
};

export const viberMessageFields = {
  viberDelivery(message: IMessageDocument, _args: unknown, context: IContext) {
    if (!message.extraData?.viber || message.internal) return null;
    return getViberMessageStatus(context, message._id);
  },
};

export const viberConnectionFields = {
  webhookUrl(
    connection: { integrationId: string },
    _args: unknown,
    context: IContext,
  ) {
    try {
      return getViberWebhookUrl(context.subdomain, connection.integrationId);
    } catch {
      return null;
    }
  },
};
