import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { GET_FB_ACCOUNTS } from '../graphql/queries/fbAccounts';
import type { FacebookGetAccountsQuery } from '~/gql/graphql';

export type TFacebookAccount = NonNullable<
  NonNullable<FacebookGetAccountsQuery['facebookGetAccounts']>[number]
>;

export const useFacebookAccounts = (integrationKind?: string) => {
  const { data, loading, error, refetch } = useQuery(GET_FB_ACCOUNTS, {
    variables: {
      kind: 'facebook',
      integrationKind,
    },
  });
  const facebookGetAccounts =
    data?.facebookGetAccounts?.filter(isDefined) ?? [];

  return { facebookGetAccounts, loading, error, refetch };
};
