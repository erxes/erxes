import { useMutation } from '@apollo/client';
import { DELETE_POS_SUMMARY_MUTATION } from '@/pos/pos-summary/graphql/mutations/posSummaryDeleteMutation';

export const useDeletePosSummary = () => {
  const [deletePosSummary, { loading }] = useMutation(
    DELETE_POS_SUMMARY_MUTATION,
  );

  const removePosSummary = async (
    productIds: string | string[],
    options?: {
      onError?: (error: any) => void;
      onCompleted?: () => void;
      refetchQueries?: string[];
    },
  ) => {
    const ids = Array.isArray(productIds) ? productIds : [productIds];

    await deletePosSummary({
      variables: { ids },
      refetchQueries: options?.refetchQueries,
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
  };

  return {
    removePosSummary,
    loading,
  };
};
