import { useQuery } from '@apollo/client';
import { GET_WHATSAPP_SENDER_INTEGRATIONS } from '../graphql/queries/getWhatsappTemplates';
import { IWhatsappSenderIntegration } from '../types/WhatsappTemplate';

/**
 * The WhatsApp numbers a new conversation can be started from.
 *
 * Only numbers that can actually list approved templates are returned by the
 * server, because the first message to someone who has never written in can
 * only ever be a template.
 */
export const useWhatsappSenderIntegrations = (skip?: boolean) => {
  const { data, loading, error } = useQuery<{
    whatsappSenderIntegrations: IWhatsappSenderIntegration[];
  }>(GET_WHATSAPP_SENDER_INTEGRATIONS, { skip });

  return {
    integrations: data?.whatsappSenderIntegrations || [],
    loading,
    error,
  };
};
