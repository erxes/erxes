import { IconChessKnight, IconShoppingCart, IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Button,
  Form,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  TextOverflowTooltip,
  useToast,
} from 'erxes-ui';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { usePosOrderChangePayments } from '../detail/hooks/usePosOrderChangePayments';
import { usePosOrderForm } from '../detail/hooks/usePosOrderForm';
import { usePosOrderQuery } from '../detail/hooks/usePosOrderQuery';
import { PosOrderForm } from '../detail/PosOrderForm';
import { TPosOrderFormData } from '../types/posOrderType';

const itemColumns: ColumnDef<any>[] = [
  {
    id: 'productName',
    accessorKey: 'productName',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Product" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={(cell.getValue() as string) || 'Unknown Product'}
        />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'count',
    accessorKey: 'count',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Count" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-center">
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toString() || '0'}
        />
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Unit Price" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-right">
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toLocaleString() || '0'}
        />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    id: 'amount',
    accessorFn: (row) => {
      const directAmount = row?.amount;
      if (typeof directAmount === 'number') return directAmount;

      const count =
        typeof row?.count === 'number' ? row.count : Number(row?.count) || 0;
      const unitPrice =
        typeof row?.unitPrice === 'number'
          ? row.unitPrice
          : Number(row?.unitPrice) || 0;

      return count * unitPrice;
    },
    header: () => <RecordTable.InlineHead icon={IconTag} label="Amount" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-right font-medium">
        <TextOverflowTooltip
          value={(cell.getValue() as number)?.toLocaleString() || '0'}
        />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];

export const PosOrderSheet = () => {
  const [posOrderId, setPosOrderId] = React.useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    const orderId = searchParams.get('pos_order_id');
    if (orderId !== posOrderId) {
      setPosOrderId(orderId || '');
    }
  }, [searchParams, posOrderId]);

  const updatePosOrderId = React.useCallback(
    (orderId: string) => {
      setPosOrderId(orderId);
      if (orderId) {
        searchParams.set('pos_order_id', orderId);
      } else {
        searchParams.delete('pos_order_id');
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const { toast } = useToast();
  const { posOrder, loading, refetch } = usePosOrderQuery(
    posOrderId || undefined,
  );
  const { posOrderChangePayments, loading: mutationLoading } =
    usePosOrderChangePayments();

  const paidAmountsSummary = React.useMemo(() => {
    if (!posOrder?.paidAmounts || !Array.isArray(posOrder.paidAmounts))
      return {};

    return posOrder.paidAmounts.reduce(
      (acc: Record<string, number>, item: any) => {
        if (item?.type) {
          acc[item.type] = Number(item.amount) || 0;
        }
        return acc;
      },
      {},
    );
  }, [posOrder?.paidAmounts]);

  const paymentSummary = React.useMemo(() => {
    return {
      cashAmount: Number(posOrder?.cashAmount) || 0,
      mobileAmount: Number(posOrder?.mobileAmount) || 0,
      ...paidAmountsSummary,
    };
  }, [posOrder?.cashAmount, posOrder?.mobileAmount, paidAmountsSummary]);

  const { methods } = usePosOrderForm(posOrder?.paidAmounts, paymentSummary);

  const submitHandler: SubmitHandler<TPosOrderFormData> = React.useCallback(
    async (data) => {
      if (!posOrderId) return;

      try {
        if (
          posOrder?.status === 'returned' ||
          posOrder?.status === 'completed'
        ) {
          toast({
            title: 'Cannot modify payment',
            description: 'This order has been returned and cannot be modified.',
            variant: 'destructive',
          });
          return;
        }

        const cashAmount = Number((data as any)?.cashAmount) || 0;
        const mobileAmount = Number((data as any)?.mobileAmount) || 0;

        const paidAmounts = Object.entries(data)
          .filter(([key]) => !['cashAmount', 'mobileAmount'].includes(key))
          .map(([type, amount]) => ({
            type,
            amount: Number(amount) || 0,
          }));
        const expectedTotal = posOrder?.totalAmount ?? 0;
        const sum =
          Number(cashAmount || 0) +
          Number(mobileAmount || 0) +
          paidAmounts.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        if (expectedTotal > 0 && sum !== expectedTotal) {
          toast({
            title: 'Amount mismatch',
            description: `Sum of payments (${sum.toLocaleString()}) must equal total amount (${expectedTotal.toLocaleString()}).`,
            variant: 'destructive',
          });
          return;
        }

        await posOrderChangePayments({
          variables: { id: posOrderId, cashAmount, mobileAmount, paidAmounts },
        });

        await refetch();

        toast({ title: 'Order updated successfully', variant: 'success' });
        updatePosOrderId('');
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          if (error.message.includes('Already returned')) {
            errorMessage =
              'This order has been returned and payment changes are not allowed.';
          } else if (error.message.includes('not balanced')) {
            errorMessage = `Payments must sum to the total amount (${
              posOrder?.totalAmount?.toLocaleString() || 0
            }).`;
          } else {
            errorMessage = error.message;
          }
        }
        toast({
          title: 'Failed to update order',
          variant: 'destructive',
          description: errorMessage,
        });
      }
    },
    [
      posOrderId,
      posOrder?.status,
      posOrder?.totalAmount,
      posOrderChangePayments,
      refetch,
      toast,
      updatePosOrderId,
    ],
  );

  return (
    <Sheet
      open={!!posOrderId}
      onOpenChange={(isOpen) => {
        if (!isOpen) updatePosOrderId('');
      }}
    >
      <Sheet.View className="p-0 sm:max-w-4xl">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={methods.handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <IconChessKnight />
              <Sheet.Title>Order detail</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4 overflow-auto">
              {posOrder && (
                <div className="flex flex-col gap-4 w-full my-4">
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Customer:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.customer?.primaryEmail || '-'}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Bill Number:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.number}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Date:
                    </span>
                    <span className="text-base font-medium">
                      {new Date(posOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Erkhet Info:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.syncErkhetInfo}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Bill Id:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.billId}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Ebarimt Date:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.putResponses?.[0]?.createdAt
                        ? new Date(
                            posOrder.putResponses[0].createdAt,
                          ).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                  {posOrder && posOrder.items && posOrder.items.length > 0 && (
                    <div className="rounded-md overflow-hidden">
                      <RecordTable.Provider
                        columns={itemColumns}
                        data={posOrder.items}
                        className="w-full"
                      >
                        <RecordTable>
                          <RecordTable.Header />
                          <RecordTable.Body>
                            <RecordTable.RowList />
                          </RecordTable.Body>
                        </RecordTable>
                      </RecordTable.Provider>
                    </div>
                  )}
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Total Amount:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.totalAmount ? posOrder.totalAmount : '0'}
                    </span>
                  </div>
                  <PosOrderForm
                    control={methods.control}
                    summary={paymentSummary}
                    paidAmounts={posOrder?.paidAmounts}
                    posName={posOrder?.posName}
                  />
                </div>
              )}
            </Sheet.Content>
            <Sheet.Footer>
              <Button type="submit" disabled={mutationLoading || loading}>
                Save payments change
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
