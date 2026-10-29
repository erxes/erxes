import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { mutations } from '@/settings/team-member/graphql';
import { useToast } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { toast } = useToast();
  const [_usersEdit, { loading }] = useMutation(mutations.USERS_INLINE_EDIT, {
    onCompleted: () => toast({ title: t('updated'), variant: 'success' }),
    onError(error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const usersEdit = ({
    variables,
    onSettled,
    ...options
  }: MutationHookOptions & { onSettled?: () => void }) => {
    void _usersEdit({
      ...options,
      variables,
      update: (cache, { data: { usersEdit } }) => {
        cache.modify({
          id: cache.identify(usersEdit),
          fields: Object.keys(variables || {}).reduce(
            (fields: Record<string | number, () => any>, field) => {
              fields[field] = () => variables?.[field];
              return fields;
            },
            {},
          ),
          optimistic: true,
        });
      },
      refetchQueries: ['UserDetail'],
    }).finally(() => onSettled?.());
  };

  return { usersEdit, loading };
};

export const useUserObjectEdit = <T extends object>(
  _id: string,
  field: 'details' | 'links',
  saved?: T,
) => {
  const { usersEdit } = useUserEdit();
  const pendingChanges = useRef<Record<string, unknown>>({});
  const pendingCount = useRef(0);

  return (changed: Record<string, unknown>) => {
    pendingChanges.current = { ...pendingChanges.current, ...changed };

    const next: Record<string, unknown> = {
      ...saved,
      ...pendingChanges.current,
    };
    delete next.__typename;

    pendingCount.current += 1;

    usersEdit({
      variables: { _id, [field]: next },
      onSettled: () => {
        pendingCount.current -= 1;

        if (!pendingCount.current) {
          pendingChanges.current = {};
        }
      },
    });
  };
};

export const useUserCustomFieldEdit = () => {
  const { usersEdit, loading: usersEditLoading } = useUserEdit();
  return {
    mutate: (variables: { _id: string } & Record<string, unknown>) =>
      usersEdit({ variables }),
    loading: usersEditLoading,
  };
};

export const useUsersStatusEdit = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { toast } = useToast();
  const [editStatus, { loading }] = useMutation(
    mutations.USERS_SET_ACTIVE_STATUS,
  );

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editStatus({
      ...options,
      variables,
      onCompleted: () => toast({ title: t('updated'), variant: 'success' }),
      onError(error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['Users', 'UserDetail'],
    });
  };
  return { editStatus: mutate, loading };
};
