import { usePosOrderChangePayments } from '@/pos/orders/detail/hooks/usePosOrderChangePayments';
import { usePosOrderForm } from '@/pos/orders/detail/hooks/usePosOrderForm';
import { usePosOrderQuery } from '@/pos/orders/detail/hooks/usePosOrderQuery';
import { TPosOrderFormData } from '@/pos/orders/types/posOrderType';
import { preserveUntypedPosPayments } from '@/pos/utils/posOrderJson';
import { useToast } from 'erxes-ui';
import { useCallback, useMemo } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type TPosOrder = NonNullable<ReturnType<typeof usePosOrderQuery>['posOrder']>;

const LOCKED_STATUSES = new Set(['returned', 'completed']);

export const usePosOrderPayments = (posOrder?: TPosOrder) => {
  const { t } = useTranslation('sales');
  const { toast } = useToast();
  const { posOrderChangePayments, loading } = usePosOrderChangePayments();

  const paymentSummary = useMemo(() => {
    const paidAmountsSummary = (posOrder?.paidAmounts || []).reduce<
      Record<string, number>
    >((acc, item) => {
      if (item?.type) {
        acc[item.type] = (acc[item.type] || 0) + (Number(item.amount) || 0);
      }
      return acc;
    }, {});

    return {
      cashAmount: Number(posOrder?.cashAmount) || 0,
      mobileAmount: Number(posOrder?.mobileAmount) || 0,
      ...paidAmountsSummary,
    };
  }, [posOrder?.cashAmount, posOrder?.mobileAmount, posOrder?.paidAmounts]);

  const { methods } = usePosOrderForm(posOrder?.paidAmounts, paymentSummary);

  const isLocked = LOCKED_STATUSES.has(posOrder?.status || '');

  const submitHandler: SubmitHandler<TPosOrderFormData> = useCallback(
    async (data) => {
      if (!posOrder?._id) return;

      if (isLocked) {
        toast({
          title: t('cannot-modify-payment'),
          description: t('order-returned-cannot-modify'),
          variant: 'destructive',
        });
        return;
      }

      const cashAmount = Number(data.cashAmount) || 0;
      const mobileAmount = Number(data.mobileAmount) || 0;
      const editedPaidAmounts = Object.entries(data)
        .filter(([key]) => !['cashAmount', 'mobileAmount'].includes(key))
        .map(([type, amount]) => ({ type, amount: Number(amount) || 0 }));
      const paidAmounts = preserveUntypedPosPayments(
        editedPaidAmounts,
        posOrder.paidAmounts,
      );
      const expectedTotal = posOrder.totalAmount ?? 0;
      const sum =
        cashAmount +
        mobileAmount +
        paidAmounts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

      if (expectedTotal > 0 && sum !== expectedTotal) {
        toast({
          title: t('amount-mismatch'),
          description: t('payments-sum-mismatch', {
            sum: sum.toLocaleString(),
            total: expectedTotal.toLocaleString(),
          }),
          variant: 'destructive',
        });
        return;
      }

      await posOrderChangePayments({
        variables: {
          id: posOrder._id,
          cashAmount,
          mobileAmount,
          paidAmounts,
        },
        refetchQueries: ['salesPosOrderDetail'],
        update: (cache) =>
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'posOrderRecords' }),
        onCompleted: () =>
          toast({ title: t('order-updated-successfully'), variant: 'success' }),
        onError: (error) => {
          let description = error.message;
          if (error.message.includes('Already returned')) {
            description = t('order-returned-no-payment-changes');
          } else if (error.message.includes('not balanced')) {
            description = t('payments-must-sum', {
              total: posOrder.totalAmount?.toLocaleString() || 0,
            });
          }
          toast({
            title: t('order-update-failed'),
            description,
            variant: 'destructive',
          });
        },
      });
    },
    [posOrder, isLocked, posOrderChangePayments, toast, t],
  );

  return {
    methods,
    paymentSummary,
    isLocked,
    saving: loading,
    onSubmit: methods.handleSubmit(submitHandler),
  };
};
