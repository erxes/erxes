import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import {
  FIXED_ASSET_CATEGORIES_ADD,
  FIXED_ASSET_CATEGORIES_EDIT,
  FIXED_ASSET_CATEGORIES_REMOVE,
  FIXED_ASSETS_ADD,
  FIXED_ASSETS_EDIT,
  FIXED_ASSETS_REMOVE,
} from '../graphql/mutations/fixedAssets';

const withToast = (
  options: OperationVariables,
  successDescription: string,
) => ({
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
    toast({
      title: 'Амжилттай',
      description: successDescription,
      variant: 'success',
    });
    options.onCompleted?.(data);
  },
});

export const useFixedAssetCategoryAdd = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_ADD, {
    refetchQueries: ['fixedAssetCategories'],
  });

  return {
    addFixedAssetCategory: (options: OperationVariables) =>
      mutate(withToast(options, 'Үндсэн хөрөнгийн бүлэг нэмэгдлээ')),
    loading,
  };
};

export const useFixedAssetCategoryEdit = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_EDIT, {
    refetchQueries: ['fixedAssetCategories', 'fixedAssets'],
  });

  return {
    editFixedAssetCategory: (options: OperationVariables) =>
      mutate(withToast(options, 'Үндсэн хөрөнгийн бүлэг шинэчлэгдлээ')),
    loading,
  };
};

export const useFixedAssetCategoryRemove = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSET_CATEGORIES_REMOVE, {
    refetchQueries: ['fixedAssetCategories'],
  });

  return {
    removeFixedAssetCategory: (options: OperationVariables) =>
      mutate(withToast(options, 'Үндсэн хөрөнгийн бүлэг устгагдлаа')),
    loading,
  };
};

export const useFixedAssetAdd = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_ADD, {
    refetchQueries: ['fixedAssets'],
  });

  return {
    addFixedAsset: (options: OperationVariables) =>
      mutate(withToast(options, 'Үндсэн хөрөнгө нэмэгдлээ')),
    loading,
  };
};

export const useFixedAssetEdit = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_EDIT, {
    refetchQueries: ['fixedAssets'],
  });

  return {
    editFixedAsset: (options: OperationVariables) =>
      mutate(withToast(options, 'Үндсэн хөрөнгө шинэчлэгдлээ')),
    loading,
  };
};

export const useFixedAssetRemove = () => {
  const [mutate, { loading }] = useMutation(FIXED_ASSETS_REMOVE, {
    refetchQueries: ['fixedAssets'],
  });

  return {
    removeFixedAsset: (options: OperationVariables) =>
      mutate(withToast(options, 'Үндсэн хөрөнгө устгагдлаа')),
    loading,
  };
};
