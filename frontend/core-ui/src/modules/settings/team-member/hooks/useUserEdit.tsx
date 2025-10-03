import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { mutations } from '@/settings/team-member/graphql';
import { useToast } from 'erxes-ui';

export const useUsersDetailEdit = () => {
  const [_usersDetailEdit, { loading }] = useMutation(
    mutations.USERS_INLINE_EDIT,
  );

  const usersDetailEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, (existing: any) => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables.details?.[field];
    });

    return _usersDetailEdit({
      ...operationVariables,
      variables,
      update: (cache, { data }) => {
        if (!data?.usersEdit) return;

        cache.modify({
          id: cache.identify(data.usersEdit),
          fields: {
            details(existingDetails = {}) {
              return {
                ...existingDetails,
                ...Object.fromEntries(
                  Object.entries(fieldsToUpdate).map(([key, updater]) => [
                    key,
                    updater(existingDetails[key]),
                  ]),
                ),
              };
            },
          },
        });
      },
    });
  };

  return { usersDetailEdit, loading };
};

export const useUserEdit = () => {
  const { toast } = useToast();
  const [_usersEdit, { loading }] = useMutation(mutations.USERS_INLINE_EDIT, {
    onCompleted: () => toast({ title: 'Updated' }),
    onError(error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const usersEdit = ({ variables, ...options }: MutationHookOptions) => {
    _usersEdit({
      ...options,
      variables,
      update: (cache, { data: { usersEdit } }) => {
        cache.modify({
          id: cache.identify(usersEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string, () => any>, field) => {
              fields[field] = () => (variables || {})[field];
              return fields;
            },
            {},
          ),
          optimistic: true,
        });
      },
      refetchQueries: ['Users', 'UserDetail'],
    });
  };

  return { usersEdit, loading };
};

export const useUsersStatusEdit = () => {
  const { toast } = useToast();
  const [editStatus, { loading }] = useMutation(
    mutations.USERS_SET_ACTIVE_STATUS,
  );

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editStatus({
      ...options,
      variables,
      onCompleted: () => toast({ title: 'Updated' }),
      onError(error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['Users'],
    });
  };
  return { editStatus: mutate, loading };
};
