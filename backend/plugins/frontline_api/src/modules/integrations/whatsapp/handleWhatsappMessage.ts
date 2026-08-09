import { stripHtml } from 'string-strip-html';
import { IModels } from '~/connectionResolvers';
import {
  sendWhatsappMedia,
  sendWhatsappTemplate,
  sendWhatsappText,
  WhatsappApiError,
} from '@/integrations/whatsapp/utils';
import { uploadAttachmentToWhatsapp } from '@/integrations/whatsapp/media';
import {
  CUSTOMER_SERVICE_WINDOW_MS,
  whatsappMediaTypeFor,
} from '@/integrations/whatsapp/constants';
import { debugError } from '@/integrations/whatsapp/debuggers';
import {
  IWhatsappTemplateDispatch,
  IWhatsappTemplateSendComponent,
} from '@/integrations/whatsapp/@types';

const OUTSIDE_WINDOW_MESSAGE =
  'This conversation is outside the 24 hour WhatsApp reply window. ' +
  'Only a pre-approved template message can be sent.';

/**
 * Reads the template the inbox dispatched, if any.
 *
 * The inbox forwards `extraInfo` verbatim from `conversationMessageAdd`, so a
 * template ride-alongs on `extraInfo.whatsappTemplate` rather than needing a
 * parallel send mutation. Anything malformed is treated as "no template" so a
 * bad payload falls back to the free-form path (and its 24 hour guard) instead
 * of being sent as an unvalidated template.
 */
const getTemplateDispatch = (
  extraInfo: unknown,
): IWhatsappTemplateDispatch | undefined => {
  if (!extraInfo || typeof extraInfo !== 'object') {
    return undefined;
  }

  const { whatsappTemplate } = extraInfo as {
    whatsappTemplate?: Partial<IWhatsappTemplateDispatch>;
  };

  if (
    !whatsappTemplate ||
    typeof whatsappTemplate.name !== 'string' ||
    typeof whatsappTemplate.languageCode !== 'string' ||
    !whatsappTemplate.name ||
    !whatsappTemplate.languageCode
  ) {
    return undefined;
  }

  return {
    name: whatsappTemplate.name,
    languageCode: whatsappTemplate.languageCode,
    components: Array.isArray(whatsappTemplate.components)
      ? (whatsappTemplate.components as IWhatsappTemplateSendComponent[])
      : undefined,
  };
};


/**
 * Handles an agent's outgoing reply, dispatched from the inbox.
 *
 * Two send paths:
 *
 * - **Template** — when `extraInfo.whatsappTemplate` carries
 *   `{ name, languageCode, components? }`. This is the ONLY thing Meta accepts
 *   more than 24 hours after the customer's last message, so it deliberately
 *   skips the window guard; blocking it would defeat its entire purpose.
 * - **Free-form text** — everything else, still gated on the 24 hour window.
 *
 * For free-form, WhatsApp only accepts a message within 24 hours of the
 * customer's last message; after that Meta rejects it (131047). The window is
 * checked locally first so the common case fails fast with a message an agent
 * can act on, but Meta remains the authority — its own rejection is translated
 * to the same wording, since our `lastCustomerMessageAt` can lag behind if a
 * webhook was missed.
 *
 * Internal notes never reach here: `conversationMessageAdd` stores them and
 * returns before it dispatches to any integration.
 */
// `subdomain` is threaded in because sending an attachment has to read it back
// out of this tenant's own file storage, and storage config is per-subdomain.
export const handleWhatsappMessage = async (
  models: IModels,
  subdomain: string,
  msg,
) => {
  const { payload } = msg;
  const doc = JSON.parse(payload || '{}');

  const conversation = await models.WhatsappConversations.getConversation({
    erxesApiId: doc.conversationId,
  });

  const integration = await models.WhatsappIntegrations.getIntegration({
    erxesApiId: conversation.integrationId,
  });

  const template = getTemplateDispatch(doc.extraInfo);
  // The wamid the agent chose to quote. Not carried on `extraInfo` like the
  // template above — `conversationMessageAdd` already forwards this generic,
  // provider-agnostic field to every integration's payload (Discord reads the
  // same field for its own reply-to, off its own foreign message id).
  const replyToMid =
    typeof doc.replyToMessageId === 'string' && doc.replyToMessageId
      ? doc.replyToMessageId
      : undefined;

  // The resolved template text is passed as `content` by the composer so the
  // thread shows what the customer actually received rather than a blank
  // bubble; a template with no body parameters still renders its approved copy.
  const content = stripHtml(doc.content || '').result.trim();

  if (!template && !content) {
    throw new Error('Cannot send an empty WhatsApp message');
  }

  const lastCustomerMessageAt = conversation.lastCustomerMessageAt;

  if (
    !template &&
    lastCustomerMessageAt &&
    Date.now() - new Date(lastCustomerMessageAt).getTime() >
      CUSTOMER_SERVICE_WINDOW_MS
  ) {
    throw new Error(OUTSIDE_WINDOW_MESSAGE);
  }

  const attachments = doc.attachments || [];

  let mid: string;

  try {
    if (template) {
      mid = await sendWhatsappTemplate({
        accessToken: integration.accessToken,
        phoneNumberId: integration.phoneNumberId,
        // Meta expects the recipient without a leading `+`.
        to: conversation.senderId,
        name: template.name,
        languageCode: template.languageCode,
        components: template.components,
        replyToMid,
      });
    } else if (attachments.length) {
      /**
       * Attachments used to be written to our database and never sent — the
       * agent saw the file in the inbox while the recipient got text only.
       *
       * Meta sends one media file per message, so each attachment becomes its
       * own message. The first carries the agent's text as its caption, which
       * is how WhatsApp itself pairs a note with a file; any remaining files
       * follow uncaptioned. The mid recorded against the row is the FIRST
       * one — that is the message the caption belongs to, and the row's
       * content is that same text.
       */
      const mids: string[] = [];

      for (const [index, attachment] of attachments.entries()) {
        const mediaId = await uploadAttachmentToWhatsapp({
          subdomain,
          accessToken: integration.accessToken,
          phoneNumberId: integration.phoneNumberId,
          attachment,
        });

        mids.push(
          await sendWhatsappMedia({
            accessToken: integration.accessToken,
            phoneNumberId: integration.phoneNumberId,
            to: conversation.senderId,
            mediaId,
            mediaType: whatsappMediaTypeFor(attachment.type),
            caption: index === 0 ? content || undefined : undefined,
            fileName: attachment.name,
            // Same reasoning as the caption: only the first message is "the"
            // reply an agent composed, so only it carries the quote.
            replyToMid: index === 0 ? replyToMid : undefined,
          }),
        );
      }

      mid = mids[0];
    } else {
      mid = await sendWhatsappText({
        accessToken: integration.accessToken,
        phoneNumberId: integration.phoneNumberId,
        to: conversation.senderId,
        text: content,
        replyToMid,
      });
    }
  } catch (e) {
    if (e instanceof WhatsappApiError && e.isOutsideServiceWindow) {
      throw new Error(OUTSIDE_WINDOW_MESSAGE);
    }

    // A dead token is otherwise invisible until someone happens to open
    // settings and click repair — `isAuthError`/`isRetryable` were computed on
    // every failure but nothing ever read them, so the integration could sit
    // broken through any number of failed sends while `healthStatus` still
    // said 'healthy'. Rate limits and other transient codes are deliberately
    // left alone: they are not evidence the integration is broken, and
    // flapping the status on every throttle would make the settings screen
    // noise rather than signal.
    if (e instanceof WhatsappApiError && e.isAuthError) {
      await models.WhatsappIntegrations.updateOne(
        { erxesApiId: integration.erxesApiId },
        { $set: { healthStatus: 'error', error: e.message } },
      ).catch(() => undefined);
    }

    debugError(`Failed to send WhatsApp message: ${e.message}`);
    throw e;
  }

  const sent = await models.WhatsappConversationMessages.addMessage({
    mid,
    conversationId: conversation._id,
    content,
    attachments: doc.attachments,
    userId: doc.userId,
    createdAt: new Date(),
    replyToMid,
  });

  /**
   * `whatsappMessageId` is returned so the inbox can bind this row to the
   * message it is about to create.
   *
   * The two are only linkable in that direction: the integration sends BEFORE
   * the inbox message exists, so this row cannot know the inbox id yet, and
   * without the bind nothing joins Meta's delivery status back to the message
   * an agent is looking at. `erxesApiMessageId` was already being set on the
   * inbound path for exactly this purpose; outbound never set it.
   */
  return { ...sent.toObject(), whatsappMessageId: sent._id };
};
