import type { MutationHookOptions } from '@apollo/client';
import { withMutationToast } from '@/utils/graphqlMutation';

import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { getI18n, useTranslation } from 'react-i18next';
import { toast } from 'erxes-ui';
import {
  FIXED_ASSET_CATEGORIES_ADD,
  FIXED_ASSET_CATEGORIES_EDIT,
  FIXED_ASSET_CATEGORIES_REMOVE,
  FIXED_ASSETS_ADD,
  FIXED_ASSETS_EDIT,
  FIXED_ASSETS_REMOVE,
  FIXED_ASSET_OWNER_RECORDS_ADD,
  FIXED_ASSET_OWNER_RECORDS_REMOVE,
  FIXED_ASSET_OWNER_RECORDS_TRANSFER,
} from '../graphql/mutations/fixedAssets';

const withToast = <Data, Variables extends Record<string, unknown>>(
  options: MutationHookOptions<Data, Variables>,
  message: string,
) =>
  withMutationToast(
    options,
    (success, description) => {
      toast({
        title: getI18n().t(success ? 'success' : 'error', { ns: 'accounting' }),
        description,
        variant: success ? 'success' : 'destructive',
      });
    },
    message,
  );

const withoutUsefulLifeVariables = <
  Options extends { variables?: Record<string, unknown> },
>(
  options: Options,
): Options => {
  const variables = { ...options.variables };
  for (const key of [
    'defaultUsefulLife',
    'defaultTaxUsefulLife',
    'usefulLife',
    'taxUsefulLife',
  ]) {
    Reflect.deleteProperty(variables, key);
  }
  return { ...options, variables };
};

export const useFixedAssetCategoryAdd = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_ADD, {
    refetchQueries: ['accountingFixedAssetCategories'],
  });

  return {
    addFixedAssetCategory: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_CATEGORIES_ADD>,
    ) =>
      mutate(
        withToast(
          withoutUsefulLifeVariables(options),
          t('fixed-asset-category-created-successfully'),
        ),
      ),
    loading,
  };
};

export const useFixedAssetCategoryEdit = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_EDIT, {
    refetchQueries: [
      'accountingFixedAssetCategories',
      'accountingSettingsFixedAssets',
    ],
  });

  return {
    editFixedAssetCategory: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_CATEGORIES_EDIT>,
    ) =>
      mutate(
        withToast(
          withoutUsefulLifeVariables(options),
          t('fixed-asset-category-updated-successfully'),
        ),
      ),
    loading,
  };
};

export const useFixedAssetCategoryRemove = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_REMOVE, {
    refetchQueries: ['accountingFixedAssetCategories'],
  });

  return {
    removeFixedAssetCategory: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_CATEGORIES_REMOVE>,
    ) =>
      mutate(
        withToast(options, t('fixed-asset-category-deleted-successfully')),
      ),
    loading,
  };
};

export const useFixedAssetAdd = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_ADD, {
    refetchQueries: ['accountingSettingsFixedAssets'],
  });

  return {
    addFixedAsset: (options: GraphqlMutationOptions<typeof FIXED_ASSETS_ADD>) =>
      mutate(
        withToast(
          withoutUsefulLifeVariables(options),
          t('fixed-asset-created-successfully'),
        ),
      ),
    loading,
  };
};

export const useFixedAssetEdit = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_EDIT, {
    refetchQueries: ['accountingSettingsFixedAssets'],
  });

  return {
    editFixedAsset: (
      options: GraphqlMutationOptions<typeof FIXED_ASSETS_EDIT>,
    ) =>
      mutate(
        withToast(
          withoutUsefulLifeVariables(options),
          t('fixed-asset-updated-successfully'),
        ),
      ),
    loading,
  };
};

export const useFixedAssetRemove = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_REMOVE, {
    refetchQueries: ['accountingSettingsFixedAssets'],
  });

  return {
    removeFixedAsset: (
      options: GraphqlMutationOptions<typeof FIXED_ASSETS_REMOVE>,
    ) => mutate(withToast(options, t('fixed-asset-deleted-successfully'))),
    loading,
  };
};

export const useFixedAssetOwnerRecordAdd = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSET_OWNER_RECORDS_ADD, {
    refetchQueries: ['AccountingFixedAssetOwnerRecords'],
  });

  return {
    addFixedAssetOwnerRecord: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_OWNER_RECORDS_ADD>,
    ) =>
      mutate(
        withToast(options, t('asset-custodian-record-created-successfully')),
      ),
    loading,
  };
};

export const useFixedAssetOwnerRecordTransfer = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(
    FIXED_ASSET_OWNER_RECORDS_TRANSFER,
    {
      refetchQueries: ['AccountingFixedAssetOwnerRecords'],
    },
  );

  return {
    transferFixedAssetOwnerRecord: (
      options: GraphqlMutationOptions<
        typeof FIXED_ASSET_OWNER_RECORDS_TRANSFER
      >,
    ) =>
      mutate(
        withToast(options, t('asset-custody-transfer-recorded-successfully')),
      ),
    loading,
  };
};

export const useFixedAssetOwnerRecordRemove = () => {
  const { t } = useTranslation('accounting');
  const [mutate, { loading }] = useMutation(FIXED_ASSET_OWNER_RECORDS_REMOVE, {
    refetchQueries: ['AccountingFixedAssetOwnerRecords'],
  });

  return {
    removeFixedAssetOwnerRecord: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_OWNER_RECORDS_REMOVE>,
    ) =>
      mutate(
        withToast(options, t('asset-custodian-record-deleted-successfully')),
      ),
    loading,
  };
};
