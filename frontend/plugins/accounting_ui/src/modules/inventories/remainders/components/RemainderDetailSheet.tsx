import { ColumnDef } from '@tanstack/table-core';
import { IconRefresh } from '@tabler/icons-react';
import {
  Button,
  RecordTable,
  RecordTableInlineCell,
  ScrollArea,
  Sheet,
  Spinner,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useBranchesMain, useDepartmentsMain } from 'ui-modules';
import { useReCalcRemainders } from '../hooks/useReCalcRemainders';
import { selectedRemainderProductAtom } from '../states/productDetailStates';

type InventoryEntry = {
  branchId: string;
  departmentId: string;
  remainder: number;
  cost: number;
  soonIn: number;
  soonOut: number;
};

const parseInventories = (inventories: any): InventoryEntry[] => {
  if (!inventories || typeof inventories !== 'object') return [];

  const rows: InventoryEntry[] = [];
  for (const branchId of Object.keys(inventories)) {
    const deptMap = inventories[branchId];
    if (!deptMap || typeof deptMap !== 'object') continue;
    for (const departmentId of Object.keys(deptMap)) {
      const data = deptMap[departmentId];
      if (!data) continue;
      rows.push({
        branchId,
        departmentId,
        remainder: data.remainder ?? 0,
        cost: data.cost ?? 0,
        soonIn: data.soonIn ?? 0,
        soonOut: data.soonOut ?? 0,
      });
    }
  }
  return rows;
};

const fmt = (v: number) =>
  v === 0 ? '' : v.toLocaleString(undefined, { maximumFractionDigits: 4 });

type InventoriesTableProps = {
  inventories: any;
};

export const InventoriesTable = ({ inventories }: InventoriesTableProps) => {
  const rows = parseInventories(inventories);

  const branchIds = [...new Set(rows.map((r) => r.branchId))];
  const departmentIds = [...new Set(rows.map((r) => r.departmentId))];

  const { branches } = useBranchesMain({
    variables: { ids: branchIds },
    skip: branchIds.length === 0,
  });
  const { departments } = useDepartmentsMain({
    variables: { ids: departmentIds },
    skip: departmentIds.length === 0,
  });

  const branchMap = Object.fromEntries((branches ?? []).map((b) => [b._id, b]));
  const deptMap = Object.fromEntries(
    (departments ?? []).map((d) => [d._id, d]),
  );

  const label = (code?: string, title?: string) =>
    [code, title].filter(Boolean).join('') || '';

  const columns: ColumnDef<InventoryEntry>[] = [
    {
      id: 'branch',
      header: 'Branch',
      cell: ({ row }) => {
        const b = branchMap[row.original.branchId];
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={label(b?.code, b?.title)} />
          </RecordTableInlineCell>
        );
      },
      size: 220,
    },
    {
      id: 'department',
      header: 'Department',
      cell: ({ row }) => {
        const d = deptMap[row.original.departmentId];
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={label(d?.code, d?.title)} />
          </RecordTableInlineCell>
        );
      },
      size: 220,
    },
    {
      id: 'remainder',
      header: 'Remainder',
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {fmt(row.original.remainder)}
        </RecordTableInlineCell>
      ),
      size: 120,
    },
    {
      id: 'cost',
      header: 'Cost',
      cell: ({ row }) => (
        <RecordTableInlineCell>{fmt(row.original.cost)}</RecordTableInlineCell>
      ),
      size: 120,
    },
    {
      id: 'soonIn',
      header: 'Soon In',
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {fmt(row.original.soonIn)}
        </RecordTableInlineCell>
      ),
      size: 120,
    },
    {
      id: 'soonOut',
      header: 'Soon Out',
      cell: ({ row }) => (
        <RecordTableInlineCell>
          {fmt(row.original.soonOut)}
        </RecordTableInlineCell>
      ),
      size: 120,
    },
  ];

  return (
    <RecordTable.Provider
      columns={columns}
      data={rows}
      className="h-full px-4 pb-4"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};

export const RemainderDetailSheet = () => {
  const [selected, setSelected] = useAtom(selectedRemainderProductAtom);
  const { addSafeRemainder, loading } = useReCalcRemainders();

  const handleReCalc = () => {
    if (!selected) return;
    addSafeRemainder({ variables: { productIds: [selected.productId] } });
  };

  return (
    <Sheet
      open={!!selected}
      onOpenChange={(open) => !open && setSelected(null)}
    >
      <Sheet.View className="sm:max-w-5xl">
        <Sheet.Header>
          <div>
            <Sheet.Title>
              {selected?.productCode && (
                <span className="text-muted-foreground mr-2 font-normal">
                  {selected.productCode}
                </span>
              )}
              {selected?.productName}
            </Sheet.Title>
          </div>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-hidden">
          <ScrollArea className="h-full">
            {selected && (
              <InventoriesTable inventories={selected.inventories} />
            )}
          </ScrollArea>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={handleReCalc} disabled={loading}>
            {loading ? (
              <>
                <Spinner />
                Running...
              </>
            ) : (
              <>
                <IconRefresh size={16} />
                ReCalc Remainder
              </>
            )}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
