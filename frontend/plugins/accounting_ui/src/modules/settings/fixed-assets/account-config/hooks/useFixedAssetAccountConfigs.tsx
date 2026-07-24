import { OperationVariables, useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  ACCOUNTINGS_CONFIGS_ADD,
  ACCOUNTINGS_CONFIGS_EDIT,
  ACCOUNTINGS_CONFIGS_REMOVE,
} from '@/settings/graphql/mutations/updateConfig';
import { GET_ACCOUNTING_CONFIGS } from '@/settings/graphql/queries/mainConfigs';
import { IFixedAssetAccountConfig } from '../types/FixedAssetAccountConfig';

const FIXED_ASSET_ACCOUNTS_CODE = 'FIXEDASSET_ACCOUNTS';

type TAccountingConfig = {
  _id: string;
  subId?: string;
  value?: IFixedAssetAccountConfig['value'];
};

const withToast = (options: OperationVariables, message: string) => ({
  ...options,
  onError: (error: Error) => {
    toast({
      title: 'Алдаа',
      description: error.message,
      variant: 'destructive',
    });
    options.onError?.(error);
  },
  onCompleted: (data: unknown) => {
    toast({ title: 'Амжилттай', description: message, variant: 'success' });
    options.onCompleted?.(data);
  },
});

export const useFixedAssetAccountConfigs = () => {
  const { data, loading, error } = useQuery<{
    accountingsConfigs: TAccountingConfig[];
  }>(GET_ACCOUNTING_CONFIGS, {
    variables: { code: FIXED_ASSET_ACCOUNTS_CODE },
  });

  const configs = data?.accountingsConfigs
    .filter((config) => Boolean(config.subId))
    .map((config) => ({
      _id: config._id,
      accountId: config.value?.accountId || (config.subId as string),
      value: config.value || { accountId: config.subId as string },
    }));

  return { configs, loading, error };
};

const mutationOptions = { refetchQueries: ['AccountingsConfigs'] };

export const useFixedAssetAccountConfigMutations = () => {
  const [add, addState] = useMutation(ACCOUNTINGS_CONFIGS_ADD, mutationOptions);
  const [edit, editState] = useMutation(
    ACCOUNTINGS_CONFIGS_EDIT,
    mutationOptions,
  );
  const [remove, removeState] = useMutation(
    ACCOUNTINGS_CONFIGS_REMOVE,
    mutationOptions,
  );

  return {
    add: (options: OperationVariables) => {
      const { accountId, value } = options.variables;
      return add(
        withToast(
          {
            ...options,
            variables: {
              code: FIXED_ASSET_ACCOUNTS_CODE,
              subId: accountId,
              value: { ...value, accountId },
            },
          },
          'Дансны багц нэмэгдлээ',
        ),
      );
    },
    edit: (options: OperationVariables) => {
      const { _id, accountId, value } = options.variables;
      return edit(
        withToast(
          {
            ...options,
            variables: {
              _id,
              subId: accountId,
              value: { ...value, accountId },
            },
          },
          'Дансны багц шинэчлэгдлээ',
        ),
      );
    },
    remove: (options: OperationVariables) =>
      remove(withToast(options, 'Дансны багц устгагдлаа')),
    adding: addState.loading,
    editing: editState.loading,
    removing: removeState.loading,
  };
};
