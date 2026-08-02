import { useQuery } from '@apollo/client';
import { GET_FB_ACCOUNTS } from '../graphql/queries/fbAccounts';

export const useFacebookAccounts = (integrationKind?: string) => {
  const { data, loading, error, refetch } = useQuery<{
    // accessToken is intentionally absent: the resolver projects credentials
    // out and the browser must never see them.
    facebookGetAccounts: {
      _id: string;
      name: string;
      pageId: string | null;
      pageName: string | null;
    }[];
  }>(GET_FB_ACCOUNTS, {
    variables: {
      kind: 'facebook',
      // Scopes the list to the Meta app that serves this integration kind, so a
      // Messenger-app account is never offered for a page-posting connect.
      integrationKind,
    },
  });
  const { facebookGetAccounts = [] } = data || {};

  return { facebookGetAccounts, loading, error, refetch };
};
