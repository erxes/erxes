import { useMutation } from '@apollo/client';
import {
  type GraphqlMutationOptions,
  notifyMutationResult,
  withMutationToast,
} from '@/utils/graphqlMutation';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ADJUST_FIXED_ASSET_ADD } from '@/adjustments/fxa/graphql/adjustFixedAssetAdd';
import { ADJUST_FIXED_ASSETS_QUERY } from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';

export const useAdjustFixedAssetAdd = () => {
  const { t } = useTranslation('accounting');
  const navigate = useNavigate();
  const [addMutation, { loading }] = useMutation(ADJUST_FIXED_ASSET_ADD);

  const addAdjustFixedAsset = (
    options?: GraphqlMutationOptions<typeof ADJUST_FIXED_ASSET_ADD>,
  ) =>
    addMutation(
      withMutationToast(
        {
          ...options,
          onCompleted: (data) => {
            options?.onCompleted?.(data);

            const newId = data?.adjustFixedAssetAdd?._id;

            navigate(
              newId
                ? `/accounting/adjustment/fxa/detail?id=${newId}`
                : '/accounting/adjustment/fxa',
            );
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
        t('fixed-asset-adjustment-created-successfully'),
      ),
    );

  return { addAdjustFixedAsset, loading };
};
