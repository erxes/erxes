import { APIMessage } from 'discord-api-types/v10';
import { IModels } from '~/connectionResolvers';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { rehostImageAttachments } from '@/integrations/discord/utils/media/attachments';
import {
  normalizeDiscordEmbeds,
  normalizeDiscordPoll,
} from '@/integrations/discord/utils/media/normalize';
import { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import { debugError } from '@/integrations/discord/debuggers';
import { receiveInboxMessage } from '@/inbox/receiveMessage';
import { type TDiscordButton } from '@/integrations/discord/@types/automationMessage';
import {
  buttonsToMirrorEmbeds,
  normalizeSentAttachments,
} from '@/integrations/discord/utils/outbound/automationPayload';

/**
 * Mirrors a sent automation reply into its inbox conversation (local message
 * store + inbox sync). Discord send already succeeded by this point; a
 * failure here is logged but swallowed so the action still returns its
 * result.
 */
export const mirrorSentMessageToInbox = async ({
  models,
  subdomain,
  conversation,
  sent,
  content,
  buttons,
}: {
  models: IModels;
  subdomain: string;
  conversation: IDiscordConversationDocument;
  sent: APIMessage;
  content: string;
  buttons?: TDiscordButton[];
}) => {
  try {
    const createdPoll = normalizeDiscordPoll(sent?.poll);
    const mirrorEmbeds = [
      ...(normalizeDiscordEmbeds(sent?.embeds) || []),
      ...buttonsToMirrorEmbeds(buttons),
    ];

    const mirrorAttachments = await rehostImageAttachments(
      subdomain,
      normalizeSentAttachments(sent?.attachments),
    );

    const extraData = {
      ...(createdPoll && { poll: createdPoll }),
      ...(mirrorEmbeds.length && { embeds: mirrorEmbeds }),
      discordMessageId: sent.id,
    };

    await models.DiscordConversationMessages.create({
      conversationId: conversation._id,
      messageId: sent?.id,
      createdAt: new Date(),
      content,
      attachments: mirrorAttachments,
      fromBot: true,
    });

    await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        conversationId: conversation.erxesApiId,
        content,
        createdAt: new Date(),
        attachments: mirrorAttachments,
        // Structured content (poll + embeds, incl. link buttons rendered as
        // embed cards) the inbox stores on `extraData` and renders as cards.
        extraData,
        providerData: { messageId: sent.id },
        // Flag automation-sent replies (e.g. the AI Agent) so the inbox can
        // visually distinguish them from human-written messages.
        fromBot: true,
      }),
    });
  } catch (e) {
    // Discord send already succeeded; only the inbox mirror failed. Surface it
    // in logs but let the action complete so the result is still returned.
    debugError(
      `Discord message sent (${
        sent?.id
      }) but failed to mirror into the inbox: ${getErrorMessage(e)}`,
    );
  }
};
