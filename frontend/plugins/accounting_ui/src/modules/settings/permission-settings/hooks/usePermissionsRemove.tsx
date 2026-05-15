import { Reference, useApolloClient, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SET_ACCOUNT_PERMISSIONS } from '../graphql/mutations/permissions';
import { IPermission, PERMISSION_NONE } from '../types/Permission';

export const usePermissionsRemove = () => {
  const client = useApolloClient();
  const [_setPermissions, { loading }] = useMutation(SET_ACCOUNT_PERMISSIONS);

  const removePermissions = (
    permissions: IPermission[],
    onCompleted?: () => void,
  ) => {
    if (!permissions.length) return;

    const byUser = new Map<string, IPermission[]>();
    for (const p of permissions) {
      if (!p.userId || !p.accountId) continue;
      const arr = byUser.get(p.userId) ?? [];
      arr.push(p);
      byUser.set(p.userId, arr);
    }

    const removedIds = new Set<string>();
    for (const p of permissions) {
      const id = client.cache.identify({
        __typename: 'AccountPermission',
        _id: p._id,
      });
      if (!id) continue;
      removedIds.add(p._id);
      client.cache.evict({ id });
    }

    client.cache.modify({
      fields: {
        accountPermissions(existing, { readField }) {
          if (!existing?.list) return existing;
          const nextList = existing.list.filter((ref: Reference) => {
            const refId = readField('_id', ref);
            return !removedIds.has(refId as string);
          });
          const removedCount = existing.list.length - nextList.length;
          return {
            ...existing,
            list: nextList,
            totalCount: Math.max(0, (existing.totalCount ?? 0) - removedCount),
          };
        },
      },
    });
    client.cache.gc();

    return Promise.all(
      Array.from(byUser.entries()).map(([userId, perms]) =>
        _setPermissions({
          variables: {
            accountIds: perms.map((p) => p.accountId),
            userId,
            level: 0,
            read: PERMISSION_NONE,
            write: PERMISSION_NONE,
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
            client.refetchQueries({ include: ['AccountPermissions'] });
          },
        }),
      ),
    ).then((res) => {
      toast({
        title: 'Success',
        description: `${permissions.length} permissions deleted`,
        variant: 'success',
      });
      onCompleted?.();
      return res;
    });
  };

  return { removePermissions, loading };
};
