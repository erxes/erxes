import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { GET_IG_ACCOUNTS } from '../graphql/queries/igAccounts';
import type { InstagramGetAccountsQuery } from '~/gql/graphql';

export type TInstagramAccount = NonNullable<
  NonNullable<InstagramGetAccountsQuery['instagramGetAccounts']>[number]
>;

export const useInstagramAccounts = () => {
  const { data, loading, error, refetch } = useQuery(GET_IG_ACCOUNTS, {
    variables: { kind: 'instagram' },
  });

  const instagramGetAccounts =
    data?.instagramGetAccounts?.filter(isDefined) ?? [];

  return { instagramGetAccounts, loading, error, refetch };
};
