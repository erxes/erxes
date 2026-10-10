import type { MutationHookOptions } from '@apollo/client';
import { withMutationToast } from '@/utils/graphqlMutation';

import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
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
        title: success ? 'Амжилттай' : 'Алдаа',
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
          'Үндсэн хөрөнгийн бүлэг нэмэгдлээ',
        ),
      ),
    loading,
  };
};

export const useFixedAssetCategoryEdit = () => {
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
          'Үндсэн хөрөнгийн бүлэг шинэчлэгдлээ',
        ),
      ),
    loading,
  };
};

export const useFixedAssetCategoryRemove = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_REMOVE, {
    refetchQueries: ['accountingFixedAssetCategories'],
  });

  return {
    removeFixedAssetCategory: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_CATEGORIES_REMOVE>,
    ) => mutate(withToast(options, 'Үндсэн хөрөнгийн бүлэг устгагдлаа')),
    loading,
  };
};

export const useFixedAssetAdd = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_ADD, {
    refetchQueries: ['accountingSettingsFixedAssets'],
  });

  return {
    addFixedAsset: (options: GraphqlMutationOptions<typeof FIXED_ASSETS_ADD>) =>
      mutate(
        withToast(
          withoutUsefulLifeVariables(options),
          'Үндсэн хөрөнгө нэмэгдлээ',
        ),
      ),
    loading,
  };
};

export const useFixedAssetEdit = () => {
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
          'Үндсэн хөрөнгө шинэчлэгдлээ',
        ),
      ),
    loading,
  };
};

export const useFixedAssetRemove = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_REMOVE, {
    refetchQueries: ['accountingSettingsFixedAssets'],
  });

  return {
    removeFixedAsset: (
      options: GraphqlMutationOptions<typeof FIXED_ASSETS_REMOVE>,
    ) => mutate(withToast(options, 'Үндсэн хөрөнгө устгагдлаа')),
    loading,
  };
};

export const useFixedAssetOwnerRecordAdd = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSET_OWNER_RECORDS_ADD, {
    refetchQueries: ['AccountingFixedAssetOwnerRecords'],
  });

  return {
    addFixedAssetOwnerRecord: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_OWNER_RECORDS_ADD>,
    ) => mutate(withToast(options, 'Эд хариуцагчийн бүртгэл нэмэгдлээ')),
    loading,
  };
};

export const useFixedAssetOwnerRecordTransfer = () => {
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
    ) => mutate(withToast(options, 'Эд хариуцагчийн шилжүүлэг бүртгэгдлээ')),
    loading,
  };
};

export const useFixedAssetOwnerRecordRemove = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSET_OWNER_RECORDS_REMOVE, {
    refetchQueries: ['AccountingFixedAssetOwnerRecords'],
  });

  return {
    removeFixedAssetOwnerRecord: (
      options: GraphqlMutationOptions<typeof FIXED_ASSET_OWNER_RECORDS_REMOVE>,
    ) => mutate(withToast(options, 'Эд хариуцагчийн бүртгэл устгагдлаа')),
    loading,
  };
};
