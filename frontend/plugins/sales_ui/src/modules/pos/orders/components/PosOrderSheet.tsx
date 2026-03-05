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
import { useSearchParams } from 'react-router-dom';
import { usePosOrderForm } from '../detail/hooks/usePosOrderForm';
import { usePosOrderQuery } from '../detail/hooks/usePosOrderQuery';
import { usePosOrderChangePayments } from '../detail/hooks/usePosOrderChangePayments';
import { SubmitHandler } from 'react-hook-form';
import { TPosOrderForm } from '../types/posOrderType';
import { PosOrderForm } from '../detail/PosOrderForm';
import { ColumnDef } from '@tanstack/table-core';
import { IconTag, IconShoppingCart } from '@tabler/icons-react';

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
  const {
    methods,
    methods: { reset, handleSubmit },
  } = usePosOrderForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const posOrderId = searchParams.get('pos_order_id');
  const { toast } = useToast();
  const { posOrder, loading } = usePosOrderQuery(posOrderId || undefined);
  const { posOrderChangePayments, loading: mutationLoading } =
    usePosOrderChangePayments();

  const setOpen = React.useCallback(
    (newPosOrderId: string | null) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (newPosOrderId) {
        newSearchParams.set('pos_order_id', newPosOrderId);
      } else {
        newSearchParams.delete('pos_order_id');
      }
      setSearchParams(newSearchParams);
    },
    [searchParams, setSearchParams],
  );

  const submitHandler: SubmitHandler<TPosOrderForm> = React.useCallback(
    async (data) => {
      if (!posOrderId) return;

      try {
        const paidAmounts = [];
        if (data.cashAmount > 0) {
          paidAmounts.push({ type: 'cash', amount: data.cashAmount });
        }
        if (data.mobileAmount > 0) {
          paidAmounts.push({ type: 'mobile', amount: data.mobileAmount });
        }
        if (data.spendPoints > 0) {
          paidAmounts.push({ type: 'khaanCard', amount: data.spendPoints });
        }

        await posOrderChangePayments({
          variables: {
            id: posOrderId,
            cashAmount: parseFloat(data.cashAmount.toString()),
            mobileAmount: parseFloat(data.mobileAmount.toString()),
            paidAmounts: paidAmounts.length > 0 ? paidAmounts : null,
            description: null,
          },
        });

        toast({ title: 'Order updated successfully', variant: 'success' });
        methods.reset();
        setOpen(null);
      } catch (error) {
        console.error('Failed to update order:', error);
      }
    },
    [posOrderId, posOrderChangePayments, toast, methods, setOpen],
  );

  React.useEffect(() => {
    if (posOrder) {
      const khaanCardPayment = posOrder.paidAmounts?.find(
        (p) => p.type === 'khaanCard',
      );
      methods.reset({
        cashAmount: posOrder.cashAmount || 0,
        mobileAmount: posOrder.mobileAmount || 0,
        spendPoints: khaanCardPayment?.amount || 0,
      });
    } else if (posOrderId) {
      methods.reset({
        cashAmount: 0,
        mobileAmount: 0,
        spendPoints: 0,
      });
    }
  }, [posOrder, posOrderId, methods]);

  return (
    <Sheet
      open={!!posOrderId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          reset();
          setOpen(null);
        }
      }}
    >
      <Sheet.View className="p-0 sm:max-w-4xl">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
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
                      {posOrder.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Final Amount:
                    </span>
                    <span className="text-base font-medium">
                      {posOrder.finalAmount}
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
                  <PosOrderForm control={methods.control} />
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
