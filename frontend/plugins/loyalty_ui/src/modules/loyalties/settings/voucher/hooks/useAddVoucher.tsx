import { MutationHookOptions, useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  CreateVoucherCampaignMutation,
  CreateVoucherCampaignMutationVariables,
} from '~/gql/graphql';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';
import { CREATE_VOUCHER_CAMPAIGN } from '../graphql/mutations/VoucherMutations';
import { QUERY_VOUCHER_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { VOUCHERS_PER_PAGE } from './useVouchers';

export const useAddVoucher = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const { cursor } = useRecordTableCursor({
    sessionKey: VOUCHERS_CURSOR_SESSION_KEY,
  });
  const [addVoucher, { loading, error }] = useMutation(
    CREATE_VOUCHER_CAMPAIGN,
    {
      refetchQueries: [
        {
          query: QUERY_VOUCHER_CAMPAIGNS,
          variables: { limit: VOUCHERS_PER_PAGE, cursor },
        },
      ],
    },
  );

  const voucherAdd = async (
    options: MutationHookOptions<
      CreateVoucherCampaignMutation,
      CreateVoucherCampaignMutationVariables
    >,
  ) => {
    return addVoucher({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('voucher-campaign-created'),
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return {
    voucherAdd,
    loading,
    error,
  };
};
