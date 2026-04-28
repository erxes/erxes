import { useQuery } from '@apollo/client';
import { GET_IG_PAGES } from '../graphql/queries/igAccounts';
import { useAtomValue } from 'jotai';
import { selectedInstagramAccountAtom } from '../states/instagramStates';

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

  const { data, loading, error } = useQuery<{
    instagramGetPages: {
      id: string;
      name: string;
      isUsed: boolean;
    }[];
  }>(GET_IG_PAGES, {
    variables: {
      accountId: resolvedAccountId,
      kind: resolvedKind,
    },
    skip: !resolvedAccountId,
  });

  const { instagramGetPages = [] } = data || {};

  return { instagramGetPages, loading, error };
};
