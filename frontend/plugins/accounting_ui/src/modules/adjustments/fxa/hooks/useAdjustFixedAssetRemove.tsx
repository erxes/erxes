import { useMutation } from '@apollo/client';
import {
  type GraphqlMutationOptions,
  notifyMutationResult,
  withMutationToast,
} from '@/utils/graphqlMutation';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ADJUST_FIXED_ASSET_REMOVE } from '@/adjustments/fxa/graphql/adjustFixedAssetRemove';
import { ADJUST_FIXED_ASSETS_QUERY } from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';

export const useAdjustFixedAssetRemove = (adjustId: string) => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [removeMutation, { loading }] = useMutation(ADJUST_FIXED_ASSET_REMOVE);

  const removeAdjustFixedAsset = (
    options?: GraphqlMutationOptions<typeof ADJUST_FIXED_ASSET_REMOVE>,
  ) =>
    removeMutation(
      withMutationToast(
        {
          ...options,
          variables: { adjustId, ...options?.variables },
          onCompleted: (data) => {
            options?.onCompleted?.(data);
            navigate('/accounting/adjustment/fxa');
          },
          refetchQueries: [
            {
              query: ADJUST_FIXED_ASSETS_QUERY,
              variables: { page: 1, perPage: 20 },
            },
          ],
          awaitRefetchQueries: true,
        },
        notifyMutationResult,
        t('fixed-asset-adjustment-deleted-successfully'),
      ),
    );

  return { removeAdjustFixedAsset, loading };
};
