import { useQuery } from '@apollo/client';
import { GET_FB_ACCOUNTS } from '../graphql/queries/fbAccounts';

export const useFacebookAccounts = () => {
  const { data, loading, error } = useQuery<{
    facebookGetAccounts: {
      _id: string;
      name: string;
      accessToken: string;
      pageId: string | null;
      pageName: string | null;
    }[];
  }>(GET_FB_ACCOUNTS, {
    variables: {
      kind: 'facebook',
    },
  });
  const { facebookGetAccounts = [] } = data || {};

  return { facebookGetAccounts, loading, error };
};
