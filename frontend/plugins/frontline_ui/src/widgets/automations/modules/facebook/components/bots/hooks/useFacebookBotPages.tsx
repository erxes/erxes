import { GET_FB_PAGES } from '@/integrations/facebook/graphql/queries/fbAccounts';
import { IntegrationType } from '@/types/Integration';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export const useFacebookBotPages = (accountId: string, pageId: string) => {
  const { data, loading } = useQuery<{
    facebookGetPages: {
      id: string;
      name: string;
      isUsed: boolean;
    }[];
  }>(GET_FB_PAGES, {
    variables: {
      accountId,
      kind: IntegrationType.FACEBOOK_MESSENGER,
    },
  });

  const facebookGetPages = data?.facebookGetPages || [];

  const page = useMemo(
    () => facebookGetPages.find(({ id }) => pageId === id),
    [facebookGetPages, pageId],
  );

  return {
    page,
    loading,
  };
};
