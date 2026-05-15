import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SET_ACCOUNT_PERMISSIONS } from '../graphql/mutations/permissions';
import {
  ISetAccountPermissionForm,
  PERMISSION_NONE,
} from '../types/Permission';

export const usePermissionAdd = () => {
  const [_setPermissions, { loading }] = useMutation(SET_ACCOUNT_PERMISSIONS);

  const addPermission = (
    values: ISetAccountPermissionForm,
    onCompleted?: () => void,
  ) => {
    if (!values.accountIds?.length || !values.userId) return;
    return _setPermissions({
      variables: {
        accountIds: values.accountIds,
        userId: values.userId,
        level: values.level ?? 0,
        read: values.read ?? PERMISSION_NONE,
        write: values.write ?? PERMISSION_NONE,
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Permission created',
          variant: 'success',
        });
        onCompleted?.();
      },
      refetchQueries: ['AccountPermissions'],
    });
  };

  return { addPermission, loading };
};
