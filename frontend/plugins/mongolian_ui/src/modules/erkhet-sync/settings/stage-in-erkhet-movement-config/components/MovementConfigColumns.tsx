import {
  IconAlignLeft,
  IconAt,
  IconLayoutKanban,
  IconUser,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { checkboxColumn } from 'erxes-ui/modules/record-table/components/CheckboxColumn';
import { useTranslation } from 'react-i18next';
import { TMovementErkhetConfig } from '../types';
import { MovementConfigEditSheet } from './MovementConfigEditSheet';
import {
  ErkhetConfigTitleCell,
  ErkhetConfigMoreCell,
} from '../../shared/components/ErkhetConfigColumnCells';

type TConfigRow = TMovementErkhetConfig & { _id: string };

export const buildMovementConfigColumns = (
  onEdit: (id: string, data: TMovementErkhetConfig) => Promise<void>,
  onDelete: (id: string) => void,
  editLoading: boolean,
): ColumnDef<TConfigRow>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TConfigRow, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) => (
          <MovementConfigEditSheet
            config={cell.row.original}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={onEdit}
            loading={editLoading}
          />
        )}
      />
    ),
    size: 25,
  },
  checkboxColumn as ColumnDef<TConfigRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconAlignLeft} label={t('title')} />;
    },
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={row.original}
        renderEditSheet={(open, onOpenChange) => (
          <MovementConfigEditSheet
            config={row.original}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={onEdit}
            loading={editLoading}
          />
        )}
      />
    ),
    size: 200,
  },
  {
    id: 'userEmail',
    accessorKey: 'userEmail',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconAt} label={t('user-email')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'defaultCustomer',
    accessorKey: 'defaultCustomer',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconUser} label={t('default-customer')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'responseField',
    accessorKey: 'responseField',
    header: () => {
      const { t } = useTranslation('mongolian');
      return <RecordTable.InlineHead icon={IconLayoutKanban} label={t('response-field')} />;
    },
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as string) || '—'}
      </RecordTableInlineCell>
    ),
    size: 160,
  },
];
