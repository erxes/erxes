import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ADJUST_FIXED_ASSET_ADD,
  ADJUST_FIXED_ASSET_REMOVE,
  ADJUST_FIXED_ASSET_RUN,
  ADJUST_FIXED_ASSET_TRANSACTION,
} from '../graphql/adjustFixedAssetMutations';
import {
  ADJUST_FIXED_ASSET_DETAIL_QUERY,
  ADJUST_FIXED_ASSETS_QUERY,
  ADJUST_FXA_DETAILS_QUERY,
} from '../graphql/adjustFixedAssetQueries';

const listRefetchQuery = {
  query: ADJUST_FIXED_ASSETS_QUERY,
  variables: { page: 1, perPage: 20 },
};

export const useAdjustFixedAssetAdd = () => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [addMutation, { loading }] = useMutation(ADJUST_FIXED_ASSET_ADD);

  const addAdjustFixedAsset = (
    options?: GraphqlMutationOptions<typeof ADJUST_FIXED_ASSET_ADD>,
  ) =>
    addMutation({
      ...options,
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('fixed-asset-adjustment-created-successfully'),
        });
        options?.onCompleted?.(data);

        const newId = data?.adjustFixedAssetAdd?._id;

        navigate(
          newId
            ? `/accounting/adjustment/fxa/detail?id=${newId}`
            : '/accounting/adjustment/fxa',
        );
      },
      refetchQueries: [listRefetchQuery],
      awaitRefetchQueries: true,
    });

  return { addAdjustFixedAsset, loading };
};

export const useAdjustFixedAssetRemove = (adjustId: string) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [removeMutation, { loading }] = useMutation(ADJUST_FIXED_ASSET_REMOVE);

  const removeAdjustFixedAsset = (
    options?: GraphqlMutationOptions<typeof ADJUST_FIXED_ASSET_REMOVE>,
  ) =>
    removeMutation({
      ...options,
      variables: { adjustId, ...options?.variables },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('fixed-asset-adjustment-deleted-successfully'),
        });
        options?.onCompleted?.(data);
        navigate('/accounting/adjustment/fxa');
      },
      refetchQueries: [listRefetchQuery],
      awaitRefetchQueries: true,
    });

  return { removeAdjustFixedAsset, loading };
};

export const useAdjustFixedAssetRun = (adjustId: string) => {
  const { t } = useTranslation('accounting');
  const [runMutation, { loading }] = useMutation(ADJUST_FIXED_ASSET_RUN);

  const runAdjustFixedAsset = (
    options?: GraphqlMutationOptions<typeof ADJUST_FIXED_ASSET_RUN>,
  ) =>
    runMutation({
      ...options,
      variables: { adjustId, ...options?.variables },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('fixed-asset-adjustment-calculated-successfully'),
        });
        options?.onCompleted?.(data);
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
    });

  return { runAdjustFixedAsset, loading };
};

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
    return transactionMutation({
      ...options,
      variables: {
        ...options.variables,
        expenseAccountId: options.variables.expenseAccountId,
        adjustId,
      },
      onError: (error: ApolloError) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('fixed-asset-adjustment-transaction-created'),
        });
        options?.onCompleted?.(data);
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
    });
  };

  return { createTransaction, loading };
};
