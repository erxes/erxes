import { DocumentNode, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  VOUCHER_CANCEL_MUTATION,
  VOUCHER_EXTEND_MUTATION,
  VOUCHER_MARK_USED_MUTATION,
} from '../graphql/mutations/mutations';

// Every list that shows a voucher reads `VouchersMain`.
const REFETCH = ['VouchersMain'];

const useVoucherMutation = <TVariables extends Record<string, unknown>>(
  mutation: DocumentNode,
  successKey: string,
) => {
  const { t } = useTranslation('loyalty');
  const { toast } = useToast();
  const [mutate, { loading }] = useMutation(mutation, {
    refetchQueries: REFETCH,
    awaitRefetchQueries: true,
  });

  const run = async (variables: TVariables) => {
    try {
      await mutate({ variables });
      toast({ title: t(successKey), variant: 'default' });
      return true;
    } catch (e) {
      toast({
        title: t('error'),
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { run, loading };
};

/** The only things done to an issued voucher: cancel, mark used, extend. */
export const useVoucherActions = () => {
  const cancel = useVoucherMutation<{ _id: string; reason: string }>(
    VOUCHER_CANCEL_MUTATION,
    'voucher-cancelled',
  );
  const markUsed = useVoucherMutation<{ _id: string; note: string }>(
    VOUCHER_MARK_USED_MUTATION,
    'voucher-marked-used',
  );
  const extend = useVoucherMutation<{ _id: string; endDate: string }>(
    VOUCHER_EXTEND_MUTATION,
    'voucher-extended',
  );

  return {
    cancelVoucher: cancel.run,
    markVoucherUsed: markUsed.run,
    extendVoucher: extend.run,
    loading: cancel.loading || markUsed.loading || extend.loading,
  };
};
