import { IconChessKnight, IconShoppingCart, IconTag } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import dayjs from 'dayjs';
import {
  Form,
  RecordTable,
  RecordTableInlineCell,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { usePosCoversQuery } from '../detail/hook/usePosCoversQuery';

const renderDetailValue = (value: unknown) => {
  if (!value) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const itemColumns: ColumnDef<any>[] = [
  {
    id: 'type',
    accessorKey: 'paidType',
    header: () => (
      <RecordTable.InlineHead icon={IconShoppingCart} label="Type" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'summary',
    accessorFn: (row) =>
      (row?.paidSummary || []).reduce(
        (sum: number, cur: { amount?: number }) => sum + (cur?.amount || 0),
        0,
      ),
    header: () => <RecordTable.InlineHead icon={IconTag} label="Summary" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 80,
  },
  {
    id: 'detail',
    accessorKey: 'details.paidDetail',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Detail" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={renderDetailValue(cell.getValue())} />
      </RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    id: 'kind',
    accessorKey: 'details.paidSummary.kind',
    header: () => <RecordTable.InlineHead icon={IconTag} label="kind" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'kindOfVal',
    accessorKey: 'details.paidSummary.kindOfVal',
    header: () => <RecordTable.InlineHead icon={IconTag} label="kindOfVal" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'value',
    accessorKey: 'details.paidSummary.value',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Value" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'amount',
    accessorKey: 'details.paidSummary.amount',
    header: () => <RecordTable.InlineHead icon={IconTag} label="amount" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
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

  const { posCovers } = usePosCoversQuery(posCoverId || undefined);

  const form = useForm<{ note?: string }>({
    defaultValues: {
      note: '',
    },
  });

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

                  <div className="rounded-md overflow-hidden relative">
                    <RecordTable.Provider
                      columns={itemColumns}
                      data={(posCovers.details || []).map((d: any) => ({
                        ...d,
                        subRows: d?.paidSummary || [],
                      }))}
                      className="w-full"
                    >
                      <RecordTable>
                        <RecordTable.Header />
                        <RecordTable.Body>
                          <RecordTable.RowList />
                        </RecordTable.Body>
                      </RecordTable>
                    </RecordTable.Provider>

                    {(!posCovers.details || posCovers.details.length === 0) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center justify-center text-center">
                          <h3 className="text-lg font-semibold text-gray-900">
                            No payment details
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            This cover has no payment breakdown.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Sheet.Content>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
