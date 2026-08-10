import { useQuery } from '@apollo/client';
import { GET_WHATSAPP_INTEGRATION_TEMPLATES } from '../graphql/queries/getWhatsappTemplates';
import { IWhatsappTemplate } from '../types/WhatsappTemplate';

/**
 * Approved templates for a WhatsApp number, keyed by integration.
 *
 * Same data as {@link useWhatsappTemplates}, but reachable before a
 * conversation exists — which is exactly the case when starting one.
 *
 * Templates change rarely and a round trip to Meta is not free, so this is
 * cache-first; the composer offers an explicit retry when a fetch fails.
 */
export const useWhatsappIntegrationTemplates = (integrationId?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    whatsappIntegrationTemplates: IWhatsappTemplate[];
  }>(GET_WHATSAPP_INTEGRATION_TEMPLATES, {
    variables: { integrationId },
    skip: !integrationId,
    fetchPolicy: 'cache-first',
  });

  return {
    templates: data?.whatsappIntegrationTemplates || [],
    loading,
    error,
    refetch,
  };
};
