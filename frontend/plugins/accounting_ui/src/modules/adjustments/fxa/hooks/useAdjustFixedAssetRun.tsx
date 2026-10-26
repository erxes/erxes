import { useMutation } from '@apollo/client';
import {
  type GraphqlMutationOptions,
  notifyMutationResult,
  withMutationToast,
} from '@/utils/graphqlMutation';
import { useTranslation } from 'react-i18next';
import { ADJUST_FIXED_ASSET_RUN } from '@/adjustments/fxa/graphql/adjustFixedAssetRun';
import {
  ADJUST_FIXED_ASSET_DETAIL_QUERY,
  ADJUST_FXA_DETAILS_QUERY,
} from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';

export const useAdjustFixedAssetRun = (adjustId: string) => {
  const { t } = useTranslation('accounting');
  const [runMutation, { loading }] = useMutation(ADJUST_FIXED_ASSET_RUN);

  const runAdjustFixedAsset = (
    options?: GraphqlMutationOptions<typeof ADJUST_FIXED_ASSET_RUN>,
  ) =>
    runMutation(
      withMutationToast(
        {
          ...options,
          variables: { adjustId, ...options?.variables },
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
        t('fixed-asset-adjustment-calculated-successfully'),
      ),
    );

  return { runAdjustFixedAsset, loading };
};
