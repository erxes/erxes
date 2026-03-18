import { IconChartBar } from '@tabler/icons-react';
import {
  Button,
  Sheet,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePosCoverDetail } from './hooks/usePosCoverDetail';
import { ColumnDef } from '@tanstack/table-core';

const paidAmountColumns: ColumnDef<any>[] = [
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="TYPE" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={(cell.getValue() as string) || 'Unknown Type'}
          />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'summary',
    accessorKey: 'summary',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label="SUMMARY" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toString() || '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'detail',
    accessorKey: 'detail',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="DETAIL" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toString() || '0'} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
];

export const PosCoverDetail = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const coverId = searchParams.get('cover_id');
  const { cover, loading, error } = usePosCoverDetail();

  const setOpen = (newCoverId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newCoverId) {
      newSearchParams.set('cover_id', newCoverId);
    } else {
      newSearchParams.delete('cover_id');
    }
    setSearchParams(newSearchParams);
  };

  // Transform paidAmounts data for display
  const paidAmountsData = React.useMemo(() => {
    if (!cover?.paidAmounts) return [];

    return cover.paidAmounts.map((payment: any) => ({
      type: payment.type,
      summary: payment.amount,
      detail: payment.amount,
    }));
  }, [cover?.paidAmounts]);

  if (!coverId) return null;

  return (
    <Sheet open={!!coverId} onOpenChange={(open) => !open && setOpen(null)}>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>Cover detail</Sheet.Title>
          <Sheet.Description>
            View and manage cover information
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content>
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div>Loading...</div>
            </div>
          )}
          {error && (
            <div className="flex items-center justify-center h-32">
              <div className="text-red-500">Error loading cover details</div>
            </div>
          )}
          {cover && !loading && !error && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between w-full gap-1">
                <span className="text-base font-medium text-muted-foreground">
                  Begin Date:
                </span>
                <span className="text-base font-medium">
                  {new Date(cover.beginDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between w-full gap-1">
                <span className="text-base font-medium text-muted-foreground">
                  End Date:
                </span>
                <span className="text-base font-medium">
                  {new Date(cover.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between w-full gap-1">
                <span className="text-base font-medium text-muted-foreground">
                  User:
                </span>
                <span className="text-base font-medium">
                  {cover.createdUser?.email || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between w-full gap-1">
                <span className="text-base font-medium text-muted-foreground">
                  POS:
                </span>
                <span className="text-base font-medium">
                  {cover.posName || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between w-full gap-1">
                <span className="text-base font-medium text-muted-foreground">
                  Total Amount:
                </span>
                <span className="text-base font-medium">
                  {cover.totalAmount || 0}
                </span>
              </div>
              <div className="flex justify-between w-full gap-1">
                <span className="text-base font-medium text-muted-foreground">
                  Description:
                </span>
                <span className="text-base font-medium">
                  {cover.description || 'No description'}
                </span>
              </div>

              {paidAmountsData && paidAmountsData.length > 0 && (
                <div className="rounded-md overflow-hidden">
                  <RecordTable.Provider
                    columns={paidAmountColumns}
                    data={paidAmountsData}
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
          <Button variant="outline" onClick={() => setOpen(null)}>
            Close
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
