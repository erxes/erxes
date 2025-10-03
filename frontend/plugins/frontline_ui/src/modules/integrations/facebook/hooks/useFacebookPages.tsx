import { useQuery } from '@apollo/client';
import { GET_FB_PAGES } from '../graphql/queries/fbAccounts';
import { useAtomValue } from 'jotai';
import { selectedFacebookAccountAtom } from '../states/facebookStates';
import { IntegrationType } from '@/types/Integration';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';

export const useFacebookPages = () => {
  const selectedAccount = useAtomValue(selectedFacebookAccountAtom);
  const { isPost } = useFbIntegrationContext();
  const { data, loading, error } = useQuery<{
    facebookGetPages: {
      id: string;
      name: string;
      isUsed: boolean;
    }[];
  }>(GET_FB_PAGES, {
    variables: {
      accountId: selectedAccount,
      kind: isPost
        ? IntegrationType.FACEBOOK_POST
        : IntegrationType.FACEBOOK_MESSENGER,
    },
  });

  const { facebookGetPages = [] } = data || {};

  return { facebookGetPages, loading, error };
};
