import {
  Sheet,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Form,
  Button,
  useToast,
} from 'erxes-ui';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePosItemDetail } from './hooks/usePosItemDetail';
import { usePosItemForm } from './hooks/usePosItemForm';
import { ColumnDef } from '@tanstack/table-core';
import {
  IconTag,
  IconShoppingCart,
  IconChessKnight,
} from '@tabler/icons-react';
import { PosItemsForm } from './PosItemsForm';
import { usePosItemChangePayments } from './hooks/usePosItemsChangePayments';
import { SubmitHandler } from 'react-hook-form';
import { TPosItemFormData } from '../types/posItemType';
import { IPosItem } from '../types/posItem';

const itemColumns: ColumnDef<NonNullable<IPosItem['items']>[0]>[] = [
  {
    id: 'productName',
    accessorKey: 'productName',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Product" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value || '-'} />
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
    cell: ({ row }) => {
      const count = row.original.count || 0;
      const unitPrice = row.original.unitPrice || 0;
      const discountAmount = row.original.discountAmount || 0;
      const amount = count * unitPrice - discountAmount;
      return (
        <RecordTableInlineCell className="text-right font-medium">
          <TextOverflowTooltip value={amount?.toLocaleString() || '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
];

export const PosItemDetailSheet = () => {
  const [posItemId, setPosItemId] = React.useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  React.useEffect(() => {
    const itemId = searchParams.get('pos_order_id');
    if (itemId !== posItemId) {
      setPosItemId(itemId || '');
    }
  }, [searchParams, posItemId]);

  const updatePosItemId = React.useCallback(
    (itemId: string) => {
      setPosItemId(itemId);
      if (itemId) {
        searchParams.set('pos_order_id', itemId);
      } else {
        searchParams.delete('pos_order_id');
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );
  const { posItem, loading, refetch } = usePosItemDetail();
  const { posItemChangePayments, loading: mutationLoading } =
    usePosItemChangePayments();

  // paidAmounts from backend: [{ _id, type, amount, title }]
  // type examples: 'cash', 'mobile', 'qpay', 'golomt', etc.
  // Build a flat map of { [type]: amount } for form default values
  const paymentSummary = React.useMemo(() => {
    if (!posItem?.paidAmounts || !Array.isArray(posItem.paidAmounts)) return {};
    return posItem.paidAmounts.reduce<Record<string, number>>(
      (acc, item) => {
        if (item?.type) acc[item.type] = item.amount ?? 0;
        return acc;
      },
      {},
    );
  }, [posItem?.paidAmounts]);

  const renderCustomerInfo = React.useMemo(() => {
    if (!posItem) return null;

    return (
      <>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Customer:
          </span>
          <span className="text-base font-medium">
            {posItem.customer?.primaryEmail || '-'}
          </span>
        </div>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Bill Number:
          </span>
          <span className="text-base font-medium">{posItem.number}</span>
        </div>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Date:
          </span>
          <span className="text-base font-medium">
            {new Date(posItem.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Erkhet Info:
          </span>
          <span className="text-base font-medium">
            {posItem.syncErkhetInfo || '-'}
          </span>
        </div>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Bill Id:
          </span>
          <span className="text-base font-medium">{posItem.billId || '-'}</span>
        </div>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Ebarimt Date:
          </span>
          <span className="text-base font-medium">
            {posItem.putResponses?.[0]?.createdAt
              ? new Date(posItem.putResponses[0].createdAt).toLocaleDateString()
              : '-'}
          </span>
        </div>
        <div className="flex justify-between w-full gap-1">
          <span className="text-base font-medium text-muted-foreground">
            Deal
          </span>
          <span className="text-base font-medium">
            {posItem.deal?.searchText || '-'}
          </span>
        </div>
      </>
    );
  }, [posItem]);

  const renderItemsTable = React.useMemo(() => {
    if (!posItem?.items || posItem.items.length === 0) return null;

    return (
      <div className="rounded-md overflow-hidden">
        <RecordTable.Provider
          columns={itemColumns}
          data={posItem.items}
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
    );
  }, [posItem?.items]);

  const renderTotalAmount = React.useMemo(() => {
    if (!posItem) return null;

    return (
      <div className="flex justify-between w-full gap-1">
        <span className="text-base font-medium text-muted-foreground">
          Total Amount:
        </span>
        <span className="text-base font-medium">
          {posItem.totalAmount ? posItem.totalAmount.toLocaleString() : '0'}
        </span>
      </div>
    );
  }, [posItem]);

  const { methods } = usePosItemForm(paymentSummary);

  const submitHandler: SubmitHandler<TPosItemFormData> = React.useCallback(
    async (data) => {
      if (!posItemId) return;

      try {
        if (posItem?.status === 'returned' || posItem?.status === 'completed') {
          toast({
            title: 'Cannot modify payment',
            description: 'This item has been returned and cannot be modified.',
            variant: 'destructive',
          });
          return;
        }

        // 'cash' type → cashAmount, 'mobile' type → mobileAmount, rest → paidAmounts array
        const cashAmount = Number(data.cash) || 0;
        const mobileAmount = Number(data.mobile) || 0;

        const paidAmounts = Object.entries(data)
          .filter(([key]) => !['cash', 'mobile'].includes(key))
          .map(([type, amount]) => ({ type, amount: Number(amount) || 0 }))
          .filter(({ amount }) => amount !== 0);

        const expectedTotal = posItem?.totalAmount ?? 0;
        const sum =
          cashAmount +
          mobileAmount +
          paidAmounts.reduce((acc, p) => acc + p.amount, 0);

        if (expectedTotal > 0 && sum !== expectedTotal) {
          toast({
            title: 'Amount mismatch',
            description: `Sum of payments (${sum.toLocaleString()}) must equal total amount (${expectedTotal.toLocaleString()}).`,
            variant: 'destructive',
          });
          return;
        }

        await posItemChangePayments({
          variables: { id: posItemId, cashAmount, mobileAmount, paidAmounts },
        });

        await refetch();

        toast({ title: 'Item updated successfully', variant: 'success' });
        updatePosItemId('');
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          if (error.message.includes('Already returned')) {
            errorMessage =
              'This item has been returned and payment changes are not allowed.';
          } else if (error.message.includes('not balanced')) {
            errorMessage = `Payments must sum to the total amount (${
              posItem?.totalAmount?.toLocaleString() || 0
            }).`;
          } else {
            errorMessage = error.message;
          }
        }
        toast({
          title: 'Failed to update item',
          variant: 'destructive',
          description: errorMessage,
        });
      }
    },
    [
      posItemId,
      posItem?.status,
      posItem?.totalAmount,
      posItemChangePayments,
      refetch,
      toast,
      updatePosItemId,
    ],
  );

  return (
    <Sheet
      open={!!posItemId}
      onOpenChange={(isOpen) => {
        if (!isOpen) updatePosItemId('');
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
              <Sheet.Title>POS Item detail</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4 overflow-auto">
              {posItem && (
                <div className="flex flex-col gap-4 w-full my-4">
                  {renderCustomerInfo}
                  {renderItemsTable}
                  {renderTotalAmount}
                  <PosItemsForm
                    control={methods.control}
                    paidAmounts={(posItem?.paidAmounts || []).filter(
                      (p): p is { type: string; amount: number; title?: string } =>
                        p.type !== undefined && p.amount !== undefined,
                    )}
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
