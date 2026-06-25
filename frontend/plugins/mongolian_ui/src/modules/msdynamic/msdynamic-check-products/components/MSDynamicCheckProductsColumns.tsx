import { IconCircleCheck, IconCode, IconHash } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { MSDynamicCheckProduct } from '../types/msDynamicCheckProduct';

export const msDynamicCheckProductColumns: ColumnDef<MSDynamicCheckProduct>[] =
  [
    RecordTable.checkboxColumn as ColumnDef<MSDynamicCheckProduct>,
    {
      id: 'code',
      accessorKey: 'displayCode',
      header: () => {
        const { t } = useTranslation('mongolian');
        return <RecordTable.InlineHead label={t('code')} icon={IconCode} />;
      },
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'name',
      accessorKey: 'displayName',
      header: () => {
        const { t } = useTranslation('mongolian');
        return <RecordTable.InlineHead label={t('name')} icon={IconHash} />;
      },
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'barcodes',
      accessorKey: 'displayBarcodes',
      header: () => {
        const { t } = useTranslation('mongolian');
        return <RecordTable.InlineHead label={t('bar-codes')} icon={IconHash} />;
      },
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue<string>()} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'unitPrice',
      accessorKey: 'displayUnitPrice',
      header: () => {
        const { t } = useTranslation('mongolian');
        return <RecordTable.InlineHead label={t('unit-price')} icon={IconHash} />;
      },
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={String(cell.getValue<string | number>())}
          />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'status',
      accessorKey: 'isSynced',
      header: () => {
        const { t } = useTranslation('mongolian');
        return <RecordTable.InlineHead label={t('status')} icon={IconCircleCheck} />;
      },
      cell: ({ row }) => {
        const { t } = useTranslation('mongolian');
        return (
          <RecordTableInlineCell>
            {row.original.isSynced ? (
              <Badge variant="success">{t('synced')}</Badge>
            ) : (
              <Badge variant="warning">{t('pending')}</Badge>
            )}
          </RecordTableInlineCell>
        );
      },
    },
  ];
