import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import {
  ADD_USERS_GROUPS,
  COPY_USERS_GROUP,
  EDIT_USERS_GROUP,
  REMOVE_USERS_GROUPS,
} from 'ui-modules/modules/team-members/graphql/mutations';

export const useUsersGroupsAdd = () => {
  const [addUsersGroups, { loading }] = useMutation(ADD_USERS_GROUPS);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    addUsersGroups({
      ...options,
      variables,
      refetchQueries: ['UsersGroups'],
    });
  };

  return {
    addUsersGroups: mutate,
    loading,
  };
};

export function useRemoveUsersGroups() {
  const { toast } = useToast();
  const [removeUsersGroupsMutation, { loading, error }] =
    useMutation(REMOVE_USERS_GROUPS);

  const removeUsersGroup = async (groupId: string): Promise<boolean> => {
    try {
      await removeUsersGroupsMutation({
        variables: { id: groupId },
        onCompleted: () => toast({ title: 'Group has been removed' }),
        onError: () =>
          toast({ title: 'Failed to remove group', variant: 'destructive' }),
        refetchQueries: ['UsersGroups'],
      });
      return true;
    } catch (err) {
      console.error('Error removing group:', err);
      return false;
    }
  };

  return {
    removeUsersGroup,
    loading,
    error,
  };
}

export const useUsersGroupsEdit = () => {
  const [edit, { loading, error }] = useMutation(EDIT_USERS_GROUP);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    edit({
      ...options,
      variables,
      update: (cache, { data: { usersGroupsEdit } }) => {
        cache.modify({
          id: cache.identify(usersGroupsEdit),
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
    });
  };

  return { usersGroupsEdit: mutate, loading, error };
};

export const useUsersGroupsCopy = () => {
  const { toast } = useToast();
  const [copy, { loading, error }] = useMutation(COPY_USERS_GROUP);

  const mutate = async (groupId: string): Promise<boolean> => {
    try {
      await copy({
        variables: { id: groupId },
        onCompleted: () => toast({ title: 'Group has been copied!' }),
        onError: () =>
          toast({ title: 'Failed to copy group', variant: 'destructive' }),
        refetchQueries: ['UsersGroups'],
      });
      return true;
    } catch (err) {
      console.error('Error copying group:', err);
      return false;
    }
  };
  return { usersGroupsCopy: mutate, loading, error };
};
