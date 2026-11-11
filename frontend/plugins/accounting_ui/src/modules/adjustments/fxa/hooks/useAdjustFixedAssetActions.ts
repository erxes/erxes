import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ADJUST_FIXED_ASSET_CANCEL,
  ADJUST_FIXED_ASSET_CLEAR,
  ADJUST_FIXED_ASSET_PUBLISH,
} from '@/adjustments/fxa/graphql/adjustFixedAssetActions';
import {
  ADJUST_FIXED_ASSET_DETAIL_QUERY,
  ADJUST_FXA_DETAILS_QUERY,
} from '@/adjustments/fxa/graphql/adjustFixedAssetQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useAdjustFixedAssetActions = (adjustId: string) => {
  const { t } = useTranslation('accounting');
  const options = {
    refetchQueries: [
      { query: ADJUST_FIXED_ASSET_DETAIL_QUERY, variables: { _id: adjustId } },
      {
        query: ADJUST_FXA_DETAILS_QUERY,
        variables: { _id: adjustId, page: 1, perPage: ACC_TRS__PER_PAGE },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: t('success') });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  };
  const [cancel, cancelState] = useMutation(ADJUST_FIXED_ASSET_CANCEL, options);
  const [clear, clearState] = useMutation(ADJUST_FIXED_ASSET_CLEAR, options);
  const [publish, publishState] = useMutation(
    ADJUST_FIXED_ASSET_PUBLISH,
    options,
  );
  return {
    cancel: () => cancel({ variables: { adjustId } }),
    clear: () => clear({ variables: { adjustId } }),
    publish: () => publish({ variables: { adjustId } }),
    loading: cancelState.loading || clearState.loading || publishState.loading,
  };
};
