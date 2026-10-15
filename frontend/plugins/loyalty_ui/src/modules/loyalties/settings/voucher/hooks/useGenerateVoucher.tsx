import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  VouchersAddMutation,
  VouchersAddMutationVariables,
} from '~/gql/graphql';
import { GENERATE_VOUCHER } from '../graphql/mutations/generateVoucherMutation';

export const useGenerateVoucher = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const [generateVoucher, { loading, error }] = useMutation(GENERATE_VOUCHER);

  const voucherGenerate = async (
    options: MutationHookOptions<
      VouchersAddMutation,
      VouchersAddMutationVariables
    >,
  ) => {
    return generateVoucher({
      ...options,
      onCompleted: (data) => {
        toast({
          title: t('success'),
          description: t('voucher-generated'),
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

  return { voucherGenerate, loading, error };
};
