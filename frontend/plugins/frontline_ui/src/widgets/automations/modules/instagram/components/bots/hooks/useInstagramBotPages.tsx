import { GET_IG_PAGES } from '@/integrations/instagram/graphql/queries/igAccounts';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';

export const useInstagramBotPages = (accountId: string, pageId: string) => {
  const { data, loading } = useQuery(GET_IG_PAGES, {
    variables: {
      accountId,
      kind: 'instagram',
    },
  });

  const page = useMemo(
    () =>
      data?.instagramGetPages
        ?.filter(isDefined)
        .find(({ id }) => pageId === id),
    [data, pageId],
  );

  return {
    page,
    loading,
  };
};
