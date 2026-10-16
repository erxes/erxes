import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { GET_IG_PAGES } from '../graphql/queries/igAccounts';
import { useAtomValue } from 'jotai';
import { selectedInstagramAccountAtom } from '../states/instagramStates';
import type { InstagramGetPagesQuery } from '~/gql/graphql';

export type TInstagramPage = NonNullable<
  NonNullable<InstagramGetPagesQuery['instagramGetPages']>[number]
>;

interface UseInstagramPagesProps {
  kind?: string;
  accountId?: string;
}

export const useInstagramPages = ({
  kind,
  accountId,
}: UseInstagramPagesProps = {}) => {
  const selectedAccount = useAtomValue(selectedInstagramAccountAtom);
  const resolvedAccountId = accountId ?? selectedAccount;
  const resolvedKind = kind ?? 'instagram-post';

  const { data, loading, error } = useQuery(GET_IG_PAGES, {
    variables: resolvedAccountId
      ? {
          accountId: resolvedAccountId,
          kind: resolvedKind,
        }
      : undefined,
    skip: !resolvedAccountId,
  });

  const instagramGetPages = data?.instagramGetPages?.filter(isDefined) ?? [];

  return { instagramGetPages, loading, error };
};
