import { useApolloClient } from '@apollo/client';
import type { User } from '@blocknote/core/comments';
import { useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { currentUserState } from 'ui-modules';
import { DocumentThreadStore } from '../utils/DocumentThreadStore';
import { readImage, toast } from 'erxes-ui';
import { COMMENT_AUTHORS } from '../graphql/queries';

export const useDocumentComments = (): {
  store: DocumentThreadStore;
  resolveUsers: (ids: string[]) => Promise<User[]>;
} => {
  const client = useApolloClient();
  const user = useAtomValue(currentUserState);
  const store = useMemo(
    () => new DocumentThreadStore(user?._id || ''),
    [user?._id],
  );
  const resolveUsers = useCallback(
    async (ids: string[]): Promise<User[]> => {
      const { data } = await client
        .query<{
          users: {
            list: {
              _id: string;
              email?: string;
              details?: { fullName?: string; avatar?: string };
            }[];
          };
        }>({
          query: COMMENT_AUTHORS,
          fetchPolicy: 'no-cache',
          variables: { ids, limit: ids.length },
        })
        .catch(() => {
          toast({
            title: 'Could not load comment authors',
            variant: 'destructive',
          });
          return { data: { users: { list: [] } } };
        });
      const users = new Map(data.users.list.map((item) => [item._id, item]));
      return ids.map((id) => {
        const author = users.get(id);
        return {
          id,
          username:
            author?.details?.fullName ||
            author?.email ||
            (id === user?._id
              ? user.details?.fullName || user.email
              : undefined) ||
            'Member',
          avatarUrl: author?.details?.avatar
            ? readImage(author.details.avatar)
            : '',
        };
      });
    },
    [client, user],
  );
  return { store, resolveUsers };
};
