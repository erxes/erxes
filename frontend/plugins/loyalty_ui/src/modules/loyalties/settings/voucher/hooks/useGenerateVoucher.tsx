import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GENERATE_VOUCHER } from '../graphql/mutations/generateVoucherMutation';

export interface GenerateVoucherResult {
  vouchersAdd: {
    _id: string;
    campaignId: string;
    ownerId: string;
    ownerType: string;
    status: string;
    createdAt: string;
  };
}

export interface GenerateVoucherVariables {
  campaignId?: string;
  ownerId?: string;
  ownerType?: string;
  status?: string;
  conditions?: any;
}

export const useGenerateVoucher = () => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const [generateVoucher, { loading, error }] = useMutation<
    GenerateVoucherResult,
    GenerateVoucherVariables
  >(GENERATE_VOUCHER);

  const voucherGenerate = async (
    options: MutationHookOptions<
      GenerateVoucherResult,
      GenerateVoucherVariables
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
