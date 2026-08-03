import { useQuery } from '@apollo/client';
import { GET_FB_ACCOUNTS } from '../graphql/queries/fbAccounts';

export const useFacebookAccounts = (integrationKind?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    facebookGetAccounts: {
      _id: string;
      name: string;
      pageId: string | null;
      pageName: string | null;
    }[];
  }>(GET_FB_ACCOUNTS, {
    variables: {
      kind: 'facebook',
      integrationKind,
    },
  });
  const { facebookGetAccounts = [] } = data || {};

  return { facebookGetAccounts, loading, error, refetch };
};
