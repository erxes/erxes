import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
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

const withToast = (
  t: TFunction<'accounting'>,
  options: OperationVariables,
  message: string,
) => ({
  ...options,
  onError: (error: Error) => {
    toast({
      title: t('error'),
      description: error.message,
      variant: 'destructive',
    });
    options.onError?.(error);
  },
  onCompleted: (data: unknown) => {
    toast({
      title: t('success'),
      description: message,
      variant: 'success',
    });
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
  const { t } = useTranslation('accounting');

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
          t,
          {
            ...options,
            variables: {
              code: FIXED_ASSET_ACCOUNTS_CODE,
              subId: accountId,
              value: { ...value, accountId },
            },
          },
          t('account-configuration-created-successfully'),
        ),
      );
    },
    edit: (options: OperationVariables) => {
      const { _id, accountId, value } = options.variables;
      return edit(
        withToast(
          t,
          {
            ...options,
            variables: {
              _id,
              subId: accountId,
              value: { ...value, accountId },
            },
          },
          t('account-configuration-updated-successfully'),
        ),
      );
    },
    remove: (options: OperationVariables) =>
      remove(
        withToast(t, options, t('account-configuration-deleted-successfully')),
      ),
    adding: addState.loading,
    editing: editState.loading,
    removing: removeState.loading,
  };
};
