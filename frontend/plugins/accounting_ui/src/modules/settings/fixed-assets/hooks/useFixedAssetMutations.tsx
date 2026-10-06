import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { OperationVariables, useMutation } from '@apollo/client';
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

const withToast = (
  t: TFunction<'accounting'>,
  options: OperationVariables,
  successDescription: string,
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
      description: successDescription,
      variant: 'success',
    });
    options.onCompleted?.(data);
  },
});

const withoutVariables = (
  options: OperationVariables,
  keys: string[],
): OperationVariables => {
  const variables = Object.fromEntries(
    Object.entries(options.variables || {}).filter(
      ([key]) => !keys.includes(key),
    ),
  );

  return {
    ...options,
    variables,
  };
};

const withoutUsefulLifeVariables = (options: OperationVariables) =>
  withoutVariables(options, [
    'defaultUsefulLife',
    'defaultTaxUsefulLife',
    'usefulLife',
    'taxUsefulLife',
  ]);

export const useFixedAssetCategoryAdd = () => {
  const { t } = useTranslation('accounting');

  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_ADD, {
    refetchQueries: ['fixedAssetCategories'],
  });

  return {
    addFixedAssetCategory: (options: OperationVariables) =>
      mutate(
        withToast(
          t,
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
    refetchQueries: ['fixedAssetCategories', 'fixedAssets'],
  });

  return {
    editFixedAssetCategory: (options: OperationVariables) =>
      mutate(
        withToast(
          t,
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
    refetchQueries: ['fixedAssetCategories'],
  });

  return {
    removeFixedAssetCategory: (options: OperationVariables) =>
      mutate(
        withToast(t, options, t('fixed-asset-category-deleted-successfully')),
      ),
    loading,
  };
};

export const useFixedAssetAdd = () => {
  const { t } = useTranslation('accounting');

  const [mutate, { loading }] = useMutation(FIXED_ASSETS_ADD, {
    refetchQueries: ['fixedAssets'],
  });

  return {
    addFixedAsset: (options: OperationVariables) =>
      mutate(
        withToast(
          t,
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
    refetchQueries: ['fixedAssets'],
  });

  return {
    editFixedAsset: (options: OperationVariables) =>
      mutate(
        withToast(
          t,
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
    refetchQueries: ['fixedAssets'],
  });

  return {
    removeFixedAsset: (options: OperationVariables) =>
      mutate(withToast(t, options, t('fixed-asset-deleted-successfully'))),
    loading,
  };
};

export const useFixedAssetOwnerRecordAdd = () => {
  const { t } = useTranslation('accounting');

  const [mutate, { loading }] = useMutation(FIXED_ASSET_OWNER_RECORDS_ADD, {
    refetchQueries: ['AccountingFixedAssetOwnerRecords'],
  });

  return {
    addFixedAssetOwnerRecord: (options: OperationVariables) =>
      mutate(withToast(t, options, t('custody-record-created-successfully'))),
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
    transferFixedAssetOwnerRecord: (options: OperationVariables) =>
      mutate(
        withToast(t, options, t('custody-transfer-recorded-successfully')),
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
    removeFixedAssetOwnerRecord: (options: OperationVariables) =>
      mutate(withToast(t, options, t('custody-record-deleted-successfully'))),
    loading,
  };
};
