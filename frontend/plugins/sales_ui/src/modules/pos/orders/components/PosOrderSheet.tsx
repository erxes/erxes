import { IconChessKnight } from '@tabler/icons-react';
import {
  Button,
  Sheet,
  Form,
  useToast,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { usePosOrderForm } from '../detail/hooks/usePosOrderForm';
import { usePosOrderQuery } from '../detail/hooks/usePosOrderQuery';
import { usePosOrderChangePayments } from '../detail/hooks/usePosOrderChangePayments';
import { SubmitHandler } from 'react-hook-form';
import { PosOrderForm } from '../detail/PosOrderForm';
import { ColumnDef } from '@tanstack/table-core';
import { IconTag, IconShoppingCart } from '@tabler/icons-react';
import { TPosOrder, TPosOrderFormData } from '../types/posOrderType';
import { usePosOrdersSummary } from '../detail/hooks/usePosOrdersSummary';

const itemColumns: ColumnDef<any>[] = [
  {
    id: 'productName',
    accessorKey: 'productName',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Product" />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={(cell.getValue() as string) || 'Unknown Product'}
          />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'count',
    accessorKey: 'count',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Count" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell className="text-center">
          <TextOverflowTooltip value={value?.toString() || '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Unit Price" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell className="text-right">
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Amount" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell className="text-right font-medium">
          <TextOverflowTooltip value={value?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
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

  const { posOrder, loading } = usePosOrderQuery(posOrderId || undefined);
  const { posId } = useParams();

  const shouldFetchSummary = Boolean(posId && posId.trim() !== '');
  const { posOrdersSummary } = usePosOrdersSummary({
    posId: shouldFetchSummary ? posId : undefined,
  });
  const { posOrderChangePayments, loading: mutationLoading } =
    usePosOrderChangePayments();

  const combinedSummary = React.useMemo(() => {
    const summary = { ...(posOrdersSummary || {}) };

    if (posOrder && typeof posOrder === 'object') {
      try {
        (Object.keys(posOrder) as Array<keyof TPosOrder | string>).forEach(
          (key) => {
            if (
              key !== '_id' &&
              key !== '__typename' &&
              typeof posOrder[key as keyof TPosOrder] === 'number'
            ) {
              summary[key as keyof TPosOrder] =
                posOrder[key as keyof TPosOrder];
            }
          },
        );
      } catch (error) {
        console.error('Error processing posOrder for summary:', error);
      }
    }

    if (posOrder?.paidAmounts && Array.isArray(posOrder.paidAmounts)) {
      posOrder.paidAmounts.forEach((paidAmount: any) => {
        if (paidAmount.type && typeof paidAmount.amount === 'number') {
          summary[paidAmount.type] = paidAmount.amount;
        }
      });
    }

    return summary;
  }, [posOrdersSummary, posOrder]);

  const { methods } = usePosOrderForm(posOrder?.paidAmounts, combinedSummary);

  const submitHandler: SubmitHandler<TPosOrderFormData> = React.useCallback(
    async (data) => {
      if (!posOrderId) return;

      try {
        await posOrderChangePayments({
          variables: {
            id: posOrderId,
          },
        });
        toast({ title: 'Order updated successfully', variant: 'success' });
        methods.reset();
        updatePosOrderId('');
      } catch (error) {
        toast({
          title: 'Failed to update order',
          variant: 'destructive',
          description: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    [posOrderId, posOrderChangePayments, toast, methods, updatePosOrderId],
  );

  return (
    <Sheet
      open={!!posOrderId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          methods.reset();
          updatePosOrderId('');
        }
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
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              {posOrder && (
                <div className="flex flex-col gap-4 w-full my-4">
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
                      Total Amount:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.totalAmount?.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Final Amount:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.finalAmount?.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Created:
                    </span>
                    <span className="text-base font-medium">
                      {new Date(posOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {posOrder.items && posOrder.items.length > 0 && (
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
                  <PosOrderForm
                    control={methods.control}
                    summary={posOrdersSummary}
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
