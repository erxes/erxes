import dayjs from 'dayjs';
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
import { ColumnDef } from '@tanstack/table-core';
import { IconTag, IconShoppingCart } from '@tabler/icons-react';
import { TPosOrderFormData } from '../../orders/types/posOrderType';
import { SubmitHandler, useForm } from 'react-hook-form';
import { usePosCoversQuery } from '../detail/hook/usePosCoversQuery';

const itemColumns: ColumnDef<any>[] = [
  {
    id: 'details.paidType',
    accessorKey: 'details.paidType',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Type" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'details.paidSummary',
    accessorKey: 'details.paidSummary',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Summary" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-center">
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'details.paidSummary.amount',
    accessorKey: 'details.paidSummary.amount',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Amount" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-right">
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];

export const PosCoversSheet = () => {
  const [posCoverId, setPosCoverId] = React.useState<string>('');
  const [searchParams, setSearchParams] = useSearchParams();

  React.useEffect(() => {
    const coverId = searchParams.get('pos_cover_id');
    if (coverId !== posCoverId) {
      setPosCoverId(coverId || '');
    }
  }, [searchParams, posCoverId]);

  const updatePosCoverId = React.useCallback(
    (coverId: string) => {
      setPosCoverId(coverId);
      if (coverId) {
        searchParams.set('pos_cover_id', coverId);
      } else {
        searchParams.delete('pos_cover_id');
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  const { toast } = useToast();
  const { posCovers, loading, refetch } = usePosCoversQuery(
    posCoverId || undefined,
  );

  const form = useForm<TPosOrderFormData>();

  const submitHandler: SubmitHandler<TPosOrderFormData> =
    React.useCallback(async () => {
      if (!posCoverId) return;

      try {
        if (
          posCovers?.status === 'returned' ||
          posCovers?.status === 'completed'
        ) {
          toast({
            title: 'Cannot modify payment',
            description: 'This cover has been returned and cannot be modified.',
            variant: 'destructive',
          });
          return;
        }

        await refetch();

        toast({ title: 'Cover updated successfully', variant: 'success' });
        updatePosCoverId('');
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          if (error.message.includes('Already returned')) {
            errorMessage =
              'This cover has been returned and payment changes are not allowed.';
          } else if (error.message.includes('not balanced')) {
            errorMessage = `Payments must sum to the total amount (${
              posCovers?.totalAmount?.toLocaleString() || 0
            }).`;
          } else {
            errorMessage = error.message;
          }
        }
        toast({
          title: 'Failed to update cover',
          variant: 'destructive',
          description: errorMessage,
        });
      }
    }, [posCovers, refetch, toast, updatePosCoverId, posCoverId]);

  return (
    <Sheet
      open={!!posCoverId}
      onOpenChange={(isOpen) => {
        if (!isOpen) updatePosCoverId('');
      }}
    >
      <Sheet.View className="p-0 sm:max-w-4xl">
        <Form {...form}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler({} as TPosOrderFormData);
            }}
          >
            <Sheet.Header>
              <IconChessKnight />
              <Sheet.Title>Cover detail</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              {posCovers && (
                <div className="flex flex-col gap-4 w-full my-4">
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Begin Date
                    </span>
                    <span className="text-base font-medium">
                      {dayjs(posCovers.beginDate).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      End Date:
                    </span>
                    <span className="text-base font-medium">
                      {dayjs(posCovers.endDate).format('YYYY-MM-DD HH:mm')}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      User:
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.user?.email}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      POS:
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.posName}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Total Amount
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.totalAmount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between w-full gap-1">
                    <span className="text-base font-medium text-muted-foreground">
                      Description:
                    </span>
                    <span className="text-base font-medium">
                      {posCovers.description}
                    </span>
                  </div>
                  {posCovers.details && posCovers.details.length > 0 && (
                    <div className="rounded-md overflow-hidden">
                      <RecordTable.Provider
                        columns={itemColumns}
                        data={posCovers.details}
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
                </div>
              )}
            </Sheet.Content>
            <Sheet.Footer>
              <Button type="submit" disabled={loading}>
                Save Note
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
