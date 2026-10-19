import { GET_FB_PAGES } from '@/integrations/facebook/graphql/queries/fbAccounts';
import { IntegrationType } from '@/types/Integration';
import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';

export const useFacebookBotPages = (accountId: string, pageId: string) => {
  const { data, loading } = useQuery(GET_FB_PAGES, {
    variables: accountId
      ? { accountId, kind: IntegrationType.FACEBOOK_MESSENGER }
      : undefined,
    skip: !accountId,
  });

  const page = useMemo(
    () =>
      data?.facebookGetPages?.filter(isDefined).find(({ id }) => pageId === id),
    [data, pageId],
  );

  return {
    page,
    loading,
  };
};
