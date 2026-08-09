import { IContext } from '~/connectionResolvers';
import { listWhatsappTemplates } from '@/integrations/whatsapp/utils';
import { IWhatsappTemplate } from '@/integrations/whatsapp/@types';

/** A connected number the composer can start a new conversation from. */
export interface IWhatsappSenderIntegration {
  _id: string;
  name: string;
  displayPhoneNumber?: string;
}

export const whatsappQueries = {
  /**
   * The WhatsApp numbers a new conversation can be started from.
   *
   * The "message a new person" composer has no conversation and no channel in
   * scope — the whole point is that no thread exists yet — so it cannot use the
   * conversation-keyed or channel-scoped lists.
   *
   * Only numbers that can actually list templates are returned: without a WABA
   * id there are no approved templates to send, and a first message to someone
   * who has never written in can ONLY be a template. Offering such a number
   * would be a guaranteed dead end.
   */
  whatsappSenderIntegrations: async (
    _root: undefined,
    _args: undefined,
    { models }: IContext,
  ): Promise<IWhatsappSenderIntegration[]> => {
    const whatsappIntegrations = await models.WhatsappIntegrations.find({
      whatsappBusinessAccountId: { $nin: [null, ''] },
      erxesApiId: { $nin: [null, ''] },
    }).lean();

    if (!whatsappIntegrations.length) {
      return [];
    }

    // The inbox row owns the name agents recognise and the active flag; an
    // archived integration must not be offered as a sender.
    const inboxIntegrations = await models.Integrations.find({
      _id: {
        $in: whatsappIntegrations.map((integration) => integration.erxesApiId),
      },
      isActive: { $ne: false },
    }).lean();

    const displayNumberById = new Map(
      whatsappIntegrations.map((integration) => [
        integration.erxesApiId,
        integration.displayPhoneNumber,
      ]),
    );

    return inboxIntegrations.map((integration) => {
      const displayPhoneNumber = displayNumberById.get(integration._id);

      return {
        _id: integration._id,
        name: integration.name || displayPhoneNumber || integration._id,
        displayPhoneNumber,
      };
    });
  },

  /**
   * Approved templates for a number, keyed by integration rather than by
   * conversation.
   *
   * Same data and same reasoning as {@link whatsappQueries.whatsappTemplates} —
   * the access token and WABA id never leave the server — but reachable before
   * a conversation exists, which is what starting one requires.
   */
  whatsappIntegrationTemplates: async (
    _root: undefined,
    { integrationId }: { integrationId: string },
    { models }: IContext,
  ): Promise<IWhatsappTemplate[]> => {
    const integration = await models.WhatsappIntegrations.getIntegration({
      erxesApiId: integrationId,
    });

    if (!integration.whatsappBusinessAccountId) {
      return [];
    }

    return listWhatsappTemplates({
      accessToken: integration.accessToken,
      whatsappBusinessAccountId: integration.whatsappBusinessAccountId,
    });
  },

  /**
   * Approved templates available on the conversation's WhatsApp number.
   *
   * Keyed by conversation rather than integration so the composer can ask for
   * templates with what it already has, and so the access token and WABA id
   * stay on the server — neither is ever exposed to the client.
   *
   * A number connected without a WABA id cannot list templates at all (the id
   * is optional on the integration), which is reported as an empty list rather
   * than an error so the UI shows its empty state instead of a failure.
   */
  whatsappTemplates: async (
    _root: undefined,
    { conversationId }: { conversationId: string },
    { models }: IContext,
  ): Promise<IWhatsappTemplate[]> => {
    const conversation = await models.WhatsappConversations.getConversation({
      erxesApiId: conversationId,
    });

    const integration = await models.WhatsappIntegrations.getIntegration({
      erxesApiId: conversation.integrationId,
    });

    if (!integration.whatsappBusinessAccountId) {
      return [];
    }

    return listWhatsappTemplates({
      accessToken: integration.accessToken,
      whatsappBusinessAccountId: integration.whatsappBusinessAccountId,
    });
  },
};
