import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { GET_FB_PAGES } from '@/integrations/facebook/graphql/queries/fbAccounts';
import { IntegrationType } from '@/types/Integration';
import { selectedWhatsappAccountAtom } from '../states/whatsappStates';

export const useWhatsappPages = () => {
  const accountId = useAtomValue(selectedWhatsappAccountAtom);

  const { data, loading, error } = useQuery<{
    facebookGetPages: {
      id: string;
      name: string;
      isUsed: boolean;
    }[];
  }>(GET_FB_PAGES, {
    variables: {
      accountId,
      kind: IntegrationType.WHATSAPP_MESSENGER,
    },
    skip: !accountId,
  });

  const { facebookGetPages = [] } = data || {};

  return { whatsappGetPages: facebookGetPages, loading, error };
};
