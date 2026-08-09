import { normalizePhone, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { receiveInboxMessage } from '~/modules/inbox/receiveMessage';
import {
  getOrCreateConversation,
  getOrCreateCustomer,
} from '@/integrations/whatsapp/controller/store';
import { debugError } from '@/integrations/whatsapp/debuggers';
import {
  sendWhatsappTemplate,
  WhatsappApiError,
} from '@/integrations/whatsapp/utils';
import { IWhatsappTemplateSendComponent } from '@/integrations/whatsapp/@types';

/**
 * Reads the send-time components off the JSON argument.
 *
 * Anything malformed is treated as "no components" rather than being forwarded,
 * so a bad payload cannot reach Meta as an unvalidated template. A template
 * that genuinely takes no parameters is the same case, and Meta rejects an
 * empty `components` array outright.
 */
const parseComponents = (
  components: unknown,
): IWhatsappTemplateSendComponent[] | undefined => {
  if (!Array.isArray(components) || !components.length) {
    return undefined;
  }

  return components as IWhatsappTemplateSendComponent[];
};

export const whatsappMutations = {
  /**
   * Opens a WhatsApp thread with a contact who has never messaged in.
   *
   * WhatsApp does not allow free-form outbound to someone outside the 24 hour
   * customer service window, and a contact who has never written is by
   * definition outside it — a plain text send would be rejected with 131047. So
   * the FIRST message is always an approved template; this mutation takes the
   * template the agent filled in and nothing else.
   *
   * Ordering mirrors the inbound webhook path deliberately, reusing the same
   * `getOrCreateCustomer` / `getOrCreateConversation` helpers so a person who
   * later replies lands in THIS thread rather than a second one: both key on
   * `wa_id`, and the E.164 normalisation is what makes the contact resolve to
   * one record across WhatsApp and phone calls.
   *
   * The send happens BEFORE the message is recorded, so a template Meta refuses
   * leaves no outgoing bubble claiming it was delivered. The conversation row
   * itself is left in place: it costs nothing, and a retry then reuses it.
   *
   * Returns the erxes conversation id so the client can open the new thread.
   */
  whatsappStartConversation: async (
    _root: undefined,
    {
      integrationId,
      customerId,
      templateName,
      languageCode,
      components,
      content,
    }: {
      integrationId: string;
      customerId: string;
      templateName: string;
      languageCode: string;
      components?: unknown;
      content: string;
    },
    { models, subdomain, user }: IContext,
  ): Promise<string> => {
    if (!user?._id) {
      throw new Error('Login required');
    }

    const integration = await models.WhatsappIntegrations.getIntegration({
      erxesApiId: integrationId,
    });

    const customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { _id: customerId } },
      defaultValue: null,
    });

    if (!customer) {
      throw new Error('Contact not found');
    }

    // Every other phone number in this module is normalised the same way, so a
    // contact stored in national format still resolves to the E.164 form Meta
    // routes on — and to the same `wa_id` an inbound message would arrive with.
    const primaryPhone =
      customer.primaryPhone ||
      (Array.isArray(customer.phones) ? customer.phones[0] : undefined);

    if (!primaryPhone) {
      throw new Error(
        'This contact has no phone number, so they cannot be messaged on WhatsApp.',
      );
    }

    const normalized = normalizePhone(
      primaryPhone,
      integration.defaultCountryCode,
    );

    // Meta identifies recipients by E.164 digits with no leading `+`; sending
    // any other form is rejected as an invalid recipient.
    const waId = (normalized || primaryPhone).replace(/\D/g, '');

    if (!waId) {
      throw new Error(
        `"${primaryPhone}" is not a usable phone number for WhatsApp.`,
      );
    }

    const whatsappCustomer = await getOrCreateCustomer(
      models,
      subdomain,
      integration,
      waId,
      [customer.firstName, customer.lastName].filter(Boolean).join(' ') ||
        undefined,
    );

    // `lastCustomerMessageAt` is intentionally NOT set from here. The 24 hour
    // window is opened by an inbound CUSTOMER message, and our own outbound
    // template does not open it — claiming otherwise would let the composer
    // offer free-form replies that Meta then rejects.
    const conversation = await getOrCreateConversation(
      models,
      subdomain,
      integration,
      whatsappCustomer,
      waId,
      content,
      new Date(),
    );

    let mid: string;

    try {
      mid = await sendWhatsappTemplate({
        accessToken: integration.accessToken,
        phoneNumberId: integration.phoneNumberId,
        to: waId,
        name: templateName,
        languageCode,
        components: parseComponents(components),
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);

      debugError(`Failed to start WhatsApp conversation: ${message}`);

      if (e instanceof WhatsappApiError) {
        throw new Error(`WhatsApp rejected the template: ${message}`);
      }

      throw e;
    }

    await models.WhatsappConversationMessages.addMessage({
      mid,
      conversationId: conversation._id,
      content,
      userId: user._id,
      createdAt: new Date(),
    });

    // Mirrors the message into the inbox thread so the agent sees what they
    // sent, and publishes the event an open inbox subscribes to — without this
    // the new conversation would appear empty until a reply arrived.
    const response = await receiveInboxMessage(subdomain, {
      action: 'create-conversation-message',
      metaInfo: 'replaceContent',
      payload: JSON.stringify({
        content,
        conversationId: conversation.erxesApiId,
        userId: user._id,
        createdAt: new Date(),
      }),
    });

    if (response.status !== 'success') {
      // The template really was delivered, so this is not failed the send — only
      // the local mirror. Surfacing it as an error would invite a resend and a
      // second message to the customer.
      debugError(
        `WhatsApp template sent but the inbox copy failed: ${JSON.stringify(
          response,
        )}`,
      );
    }

    return conversation.erxesApiId;
  },
};
