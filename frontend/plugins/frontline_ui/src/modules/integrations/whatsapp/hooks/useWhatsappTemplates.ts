import { useQuery } from '@apollo/client';
import { GET_WHATSAPP_TEMPLATES } from '../graphql/queries/getWhatsappTemplates';
import { IWhatsappTemplate } from '../types/WhatsappTemplate';

interface IWhatsappTemplatesResponse {
  whatsappTemplates: IWhatsappTemplate[];
}

/**
 * Approved templates for the conversation's WhatsApp number.
 *
 * Templates change rarely and a round trip to Meta is not free, so this is
 * cache-first; the picker offers an explicit retry when a fetch fails.
 */
export const useWhatsappTemplates = (conversationId?: string) => {
  const { data, loading, error, refetch } =
    useQuery<IWhatsappTemplatesResponse>(GET_WHATSAPP_TEMPLATES, {
      variables: { conversationId },
      skip: !conversationId,
      fetchPolicy: 'cache-first',
    });

  return {
    templates: data?.whatsappTemplates || [],
    loading,
    error,
    refetch,
  };
};
