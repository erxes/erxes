import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
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
  const { toast } = useToast();
  const [generateVoucher, { loading, error }] = useMutation<
    GenerateVoucherResult,
    GenerateVoucherVariables
  >(GENERATE_VOUCHER);

  const voucherGenerate = async (
    options: MutationHookOptions<GenerateVoucherResult, GenerateVoucherVariables>,
  ) => {
    return generateVoucher({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Voucher generated successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
    });
  };

  return { voucherGenerate, loading, error };
};
