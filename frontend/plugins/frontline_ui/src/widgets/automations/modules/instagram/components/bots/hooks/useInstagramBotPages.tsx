import { GET_IG_PAGES } from '@/integrations/instagram/graphql/queries/igAccounts';
import { IntegrationType } from '@/types/Integration';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export const useInstagramBotPages = (accountId: string, pageId: string) => {
  const { data, loading } = useQuery<{
    instagramGetPages: {
      id: string;
      name: string;
      isUsed: boolean;
    }[];
  }>(GET_IG_PAGES, {
    variables: {
      accountId,
      kind: IntegrationType.INSTAGRAM_MESSENGER,
    },
  });

  const instagramGetPages = data?.instagramGetPages || [];

  const page = useMemo(
    () => instagramGetPages.find(({ id }) => pageId === id),
    [instagramGetPages, pageId],
  );

  return {
    page,
    loading,
  };
};
