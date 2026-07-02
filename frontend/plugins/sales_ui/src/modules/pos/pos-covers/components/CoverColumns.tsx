import {
  IconBuilding,
  IconLabel,
  IconMobiledata,
  IconPhone,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { useTranslation } from 'react-i18next';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

import { ICovers } from '@/pos/pos-covers/types/posCover';
import { coverMoreColumn } from '@/pos/pos-covers/components/CoversMoreColumns';
import { ClickablePosName } from '@/pos/pos-covers/components/ClickablePosName';

export const coverColumns: ColumnDef<ICovers>[] = [
  coverMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ICovers>,
  {
    id: 'posName',
    accessorKey: 'posName',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconPhone} label={t('pos')} />;
    },
    cell: ({ row }) => {
      return <ClickablePosName value={row.original.posName || ''} row={row} />;
    },
    size: 400,
  },
  {
    id: 'beginDate',
    accessorKey: 'beginDate',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('begin-date')} />;
    },
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value
              value={(cell.getValue() as string) || 'Invalid Date'}
            />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.beginDate);
      const dateB = new Date(rowB.original.beginDate);
      return dateA.getTime() - dateB.getTime();
    },
    size: 300,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconMobiledata} label={t('end-date')} />;
    },
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = new Date(rowA.original.endDate);
      const dateB = new Date(rowB.original.endDate);
      return dateA.getTime() - dateB.getTime();
    },
    size: 300,
  },

  {
    id: 'user.email',
    accessorKey: 'user.email',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconBuilding} label={t('user')} />;
    },
    cell: ({ row }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={row.original.user?.email || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
];
