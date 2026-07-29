import type { CellContext, ColumnDef } from '@tanstack/table-core';
import { IconBriefcase, IconLabelFilled } from '@tabler/icons-react';
import { Empty, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { type ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { IDeal } from '@/deals/types/deals';

type PrintDealsRecordTableProps = {
  deals: IDeal[];
  loading: boolean;
  onSelectionChange: (dealIds: string[]) => void;
};

const PrintDealSelectionSync = ({
  onSelectionChange,
}: Pick<PrintDealsRecordTableProps, 'onSelectionChange'>) => {
  const { table } = RecordTable.useRecordTable();
  const rowSelection = table.getState().rowSelection;

  useEffect(() => {
    onSelectionChange(
      table
        .getSelectedRowModel()
        .rows.map((row) => (row.original as IDeal)._id),
    );
  }, [onSelectionChange, rowSelection, table]);

  return null;
};

const PrintDealNumberHeader = () => {
  const { t } = useTranslation('sales');

  return <RecordTable.InlineHead label={t('number')} icon={IconLabelFilled} />;
};

const PrintDealNumberCell = ({ row }: CellContext<IDeal, unknown>) => (
  <RecordTableInlineCell className="text-muted-foreground">
    {row.original.number || ''}
  </RecordTableInlineCell>
);

const PrintDealNameHeader = () => {
  const { t } = useTranslation('sales');

  return <RecordTable.InlineHead label={t('name')} icon={IconLabelFilled} />;
};

const PrintDealNameCell = ({ row }: CellContext<IDeal, unknown>) => {
  const { t } = useTranslation('sales');

  return (
    <RecordTableInlineCell className="font-medium">
      {row.original.name || t('untitled-deal')}
    </RecordTableInlineCell>
  );
};

const PRINT_DEAL_COLUMNS: ColumnDef<IDeal>[] = [
  RecordTable.checkboxColumn as ColumnDef<IDeal>,
  {
    id: 'number',
    accessorKey: 'number',
    header: PrintDealNumberHeader,
    cell: PrintDealNumberCell,
    size: 140,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: PrintDealNameHeader,
    cell: PrintDealNameCell,
    size: 360,
  },
];

export const PrintDealsRecordTable = ({
  deals,
  loading,
  onSelectionChange,
}: PrintDealsRecordTableProps) => {
  const { t } = useTranslation('sales');
  let tableContent: ReactNode;

  if (loading) {
    tableContent = (
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowSkeleton rows={5} />
        </RecordTable.Body>
      </RecordTable>
    );
  } else if (deals.length === 0) {
    tableContent = (
      <Empty className="min-h-40 border-0 bg-transparent">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconBriefcase />
          </Empty.Media>
          <Empty.Title>{t('no-deals-in-stage')}</Empty.Title>
        </Empty.Header>
      </Empty>
    );
  } else {
    tableContent = (
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
        </RecordTable.Body>
      </RecordTable>
    );
  }

  return (
    <RecordTable.Provider
      columns={PRINT_DEAL_COLUMNS}
      data={deals}
      className="max-h-[calc(100dvh-28rem)] min-h-40 overflow-auto"
      stickyColumns={['checkbox', 'number']}
      tableId="sales_print_deals_record_table"
    >
      <PrintDealSelectionSync onSelectionChange={onSelectionChange} />
      {tableContent}
    </RecordTable.Provider>
  );
};
