import { useApolloClient, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SET_ACCOUNT_PERMISSIONS } from '../graphql/mutations/permissions';
import {
  IPermission,
  PermissionReadScope,
  PermissionWriteScope,
  PERMISSION_NONE,
} from '../types/Permission';

type EditableFields = {
  level?: number;
  read?: PermissionReadScope;
  write?: PermissionWriteScope;
};

export const usePermissionEdit = () => {
  const client = useApolloClient();
  const [_setPermissions, { loading }] = useMutation(SET_ACCOUNT_PERMISSIONS);

  const writeOptimistic = (
    permissions: IPermission[],
    changes: EditableFields,
  ) => {
    for (const p of permissions) {
      const id = client.cache.identify({
        __typename: 'AccountPermission',
        _id: p._id,
      });
      if (!id) continue;
      client.cache.modify({
        id,
        fields: {
          level: (prev) => changes.level ?? prev,
          read: (prev) => changes.read ?? prev,
          write: (prev) => changes.write ?? prev,
        },
      });
    }
  };

  const setPermissions = (
    permissions: IPermission[],
    userId: string,
    changes: EditableFields,
  ) => {
    const accountIds = permissions
      .map((p) => p.accountId)
      .filter((id): id is string => Boolean(id));
    if (!accountIds.length || !userId) return;

    const first = permissions[0];
    const variables = {
      accountIds,
      userId,
      level: changes.level ?? first.level ?? 0,
      read: changes.read ?? first.read ?? PERMISSION_NONE,
      write: changes.write ?? first.write ?? PERMISSION_NONE,
    };

    writeOptimistic(permissions, changes);

    return _setPermissions({
      variables,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        client.refetchQueries({ include: ['AccountPermissions'] });
      },
    });
  };

  const editPermission = (
    permission: IPermission,
    changes: Partial<EditableFields>,
  ) => {
    if (!permission.accountId || !permission.userId) return;
    const promise = setPermissions([permission], permission.userId, changes);
    promise?.then(({ errors } = {} as any) => {
      if (errors?.length) return;
      toast({
        title: 'Success',
        description: 'Permission updated',
        variant: 'success',
      });
    });
    return promise;
  };

  const editPermissionsBulk = (
    permissions: IPermission[],
    changes: Partial<EditableFields>,
  ) => {
    if (!permissions.length) return;

    const byUser = new Map<string, IPermission[]>();
    for (const p of permissions) {
      if (!p.userId || !p.accountId) continue;
      const arr = byUser.get(p.userId) ?? [];
      arr.push(p);
      byUser.set(p.userId, arr);
    }

    const promise = Promise.all(
      Array.from(byUser.entries()).map(([userId, perms]) =>
        setPermissions(perms, userId, changes),
      ),
    );
    promise.then((results) => {
      const hasErrors = results.some((r) => r?.errors?.length);
      if (hasErrors) return;
      toast({
        title: 'Success',
        description: `${permissions.length} permissions updated`,
        variant: 'success',
      });
    });
    return promise;
  };

  return { editPermission, editPermissionsBulk, loading };
};
