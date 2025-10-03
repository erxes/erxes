import { useMutation, ApolloCache, MutationHookOptions } from '@apollo/client';
import { useCallback } from 'react';
import posMutations from '../graphql/mutations';
import posQueries from '../graphql/queries';
import {
  combineFormData,
  DeliveryConfigFormValues,
  FinanceConfigFormValues,
  FormStepData,
  PosDetailFormValues,
  posDetailSchema,
} from '../create-pos/components/formSchema';
import {
  AddPosDetailResult,
  AddPosDetailVariables,
  PosData,
} from '../types/mutations';

const DEFAULT_PER_PAGE = 30;

const updateCacheAfterAdd = (
  cache: ApolloCache<any>,
  newPosData: PosData
): void => {
  try {
    const queryVariables = { perPage: DEFAULT_PER_PAGE };
    
    const existingData = cache.readQuery<{ posList: PosData[] }>({
      query: posQueries.posList,
      variables: queryVariables,
    });

    if (!existingData?.posList) return;

    cache.writeQuery<{ posList: PosData[] }>({
      query: posQueries.posList,
      variables: queryVariables,
      data: {
        posList: [...existingData.posList, newPosData],
      },
    });
  } catch (error) {
    console.error('Cache update error after add:', error);
  }
};

const updateCacheAfterRemove = (
  cache: ApolloCache<any>,
  removedId: string
): void => {
  try {
    const queryVariables = { perPage: DEFAULT_PER_PAGE };
    
    const existingData = cache.readQuery<{ posList: PosData[] }>({
      query: posQueries.posList,
      variables: queryVariables,
    });

    if (!existingData?.posList) return;

    const filteredList = existingData.posList.filter(
      (item) => item._id !== removedId
    );

    cache.writeQuery<{ posList: PosData[] }>({
      query: posQueries.posList,
      variables: queryVariables,
      data: {
        posList: filteredList,
      },
    });
  } catch (error) {
    console.error('Cache update error after remove:', error);
  }
};

const extractDeliveryConfig = (
  formData: FormStepData,
  validatedData: PosDetailFormValues
): DeliveryConfigFormValues | null => {
  if (formData.deliveryConfig) {
    return {
      boardId: formData.deliveryConfig?.boardId,
      pipeline: formData.deliveryConfig?.pipeline,
      stage: formData.deliveryConfig?.stage,
      watchedUsers: formData.deliveryConfig?.watchedUsers,
      assignedUsers: formData.deliveryConfig.assignedUsers ,
      deliveryProduct: formData.deliveryConfig.deliveryProduct,
      watchedUserIds: formData.deliveryConfig.watchedUserIds || [],
      assignedUserIds: formData.deliveryConfig.assignedUserIds || [],
    };
  }

  return null;
};

const extractFinanceConfig = (
  formData: FormStepData,
  validatedData: PosDetailFormValues
): FinanceConfigFormValues | null => {
  if (formData.financeConfig) {
    return {
      isSyncErkhet: formData.financeConfig.isSyncErkhet,
      checkErkhet: formData.financeConfig.checkErkhet,
      checkInventories: formData.financeConfig.checkInventories,
      userEmail: formData.financeConfig.userEmail,
      beginBillNumber: formData.financeConfig.beginBillNumber,
      defaultPay: formData.financeConfig.defaultPay,
      account: formData.financeConfig.account,
      location: formData.financeConfig.location,
      getRemainder: formData.financeConfig.getRemainder,
    };
  }
  return null;
};

export function useAddPosDetail(
  options?: MutationHookOptions<AddPosDetailResult, AddPosDetailVariables>
) {
  const [posAdd, { loading, error, data }] = useMutation<
    AddPosDetailResult,
    AddPosDetailVariables
  >(posMutations.posAdd, {
    ...options,
    update: (cache, { data }) => {
      if (data?.posAdd) {
        updateCacheAfterAdd(cache, data.posAdd);
      }
    },
    onError: (error) => {
      console.error('POS add mutation error:', error);
      options?.onError?.(error);
    },
  });

  return { 
    posAdd, 
    loading, 
    error, 
    data 
  };
}

export function useSubmitPosForm() {
  const { posAdd, loading: addLoading, error: addError } = useAddPosDetail();

  const submitForm = useCallback(async (formData: FormStepData) => {
    try {
      const combinedData = combineFormData(formData);
      const validatedData = posDetailSchema.parse(combinedData);

      const deliveryConfig = extractDeliveryConfig(formData, validatedData);
      const financeConfig = extractFinanceConfig(formData, validatedData);

      const variables: AddPosDetailVariables = {
        name: validatedData.name,
        description: validatedData.description,
        adminIds: validatedData.adminIds,
        cashierIds: validatedData.cashierIds,
        scopeBrandIds: validatedData.scopeBrandIds,
        branchId: validatedData.branchId,
        departmentId: validatedData.departmentId,
        productDetails: validatedData.productDetails?.map((pd) => pd.productId),
        paymentIds: validatedData.paymentIds,
        paymentTypes: validatedData.paymentTypes,
        beginNumber: validatedData.beginNumber,
        maxSkipNumber: validatedData.maxSkipNumber,
        uiOptions: validatedData.uiOptions,
        catProdMappings: validatedData.catProdMappings,
        initialCategoryIds: validatedData.initialCategoryIds,
        kioskExcludeCategoryIds: validatedData.kioskExcludeCategoryIds,
        kioskExcludeProductIds: validatedData.kioskExcludeProductIds,
        checkRemainder: validatedData.checkRemainder,
        permissionConfig: validatedData.permissionConfig,
        allowTypes: validatedData.allowTypes,
        checkExcludeCategoryIds: validatedData.checkExcludeCategoryIds,
        erkhetConfig: financeConfig,
        ...(deliveryConfig && { deliveryConfig }),
      };

      const result = await posAdd({ variables });
      
      if (!result.data?.posAdd) {
        throw new Error('POS creation failed: No data returned');
      }

      return result;
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  }, [posAdd]);

  return {
    submitForm,
    loading: addLoading,
    error: addError,
  };
}

export function useRemovePosDetail() {
  const [posRemove, { loading, error }] = useMutation<
    { posRemove: string },
    { _id: string }
  >(posMutations.posRemove, {
    update: (cache, { data }, { variables }) => {
      if (variables?._id) {
        updateCacheAfterRemove(cache, variables._id);
      }
    },
    onError: (error) => {
      console.error('POS remove mutation error:', error);
    },
  });

  const removePosDetail = useCallback(async (id: string) => {
    if (!id) {
      throw new Error('POS ID is required for removal');
    }

    try {
      const result = await posRemove({ variables: { _id: id } });
      
      if (!result.data?.posRemove) {
        throw new Error('POS removal failed: No confirmation returned');
      }

      return result;
    } catch (error) {
      console.error('POS removal error:', error);
      throw error;
    }
  }, [posRemove]);

  return { 
    removePosDetail, 
    loading, 
    error 
  };
}