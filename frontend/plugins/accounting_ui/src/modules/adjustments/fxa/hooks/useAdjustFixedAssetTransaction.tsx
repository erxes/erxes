import { useMutation } from '@apollo/client';
import {
  type GraphqlMutationOptions,
  notifyMutationResult,
  withMutationToast,
} from '@/utils/graphqlMutation';
import { useTranslation } from 'react-i18next';
import { ADJUST_FIXED_ASSET_TRANSACTION } from '@/adjustments/fxa/graphql/adjustFixedAssetTransaction';
import {
  ADJUST_FIXED_ASSET_DETAIL_QUERY,
  ADJUST_FXA_DETAILS_QUERY,
} from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';

export const useAdjustFixedAssetTransaction = (adjustId: string) => {
  const { t } = useTranslation('accounting');
  const [transactionMutation, { loading }] = useMutation(
    ADJUST_FIXED_ASSET_TRANSACTION,
  );

  const createTransaction = (
    options: GraphqlMutationOptions<
      typeof ADJUST_FIXED_ASSET_TRANSACTION,
      'adjustId'
    >,
  ) => {
    if (!options.variables?.expenseAccountId)
      throw new Error('Expense account id is required');
    return transactionMutation(
      withMutationToast(
        {
          ...options,
          variables: {
            ...options.variables,
            expenseAccountId: options.variables.expenseAccountId,
            adjustId,
          },
          refetchQueries: [
            {
              query: ADJUST_FIXED_ASSET_DETAIL_QUERY,
              variables: { _id: adjustId ?? '' },
            },
            {
              query: ADJUST_FXA_DETAILS_QUERY,
              variables: { _id: adjustId, page: 1, perPage: 20 },
            },
          ],
          awaitRefetchQueries: true,
        },
        notifyMutationResult,
        t('fixed-asset-adjustment-transaction-created'),
      ),
    );
  };

  return { createTransaction, loading };
};
