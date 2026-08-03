import { Icon, IconAlignLeft } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode } from 'react';
import {
  ErkhetConfigMoreCell,
  ErkhetConfigTitleCell,
} from './ErkhetConfigColumnCells';

type TErkhetConfigRow = { _id: string; title?: string };

export type RenderErkhetConfigEditSheet<TRow> = (
  config: TRow,
  open: boolean,
  onOpenChange: (open: boolean) => void,
) => ReactNode;

interface ErkhetConfigColumnsArgs<TRow> {
  t: TFunction;
  onDelete: (id: string) => void;
  editLoading: boolean;
  renderEditSheet: RenderErkhetConfigEditSheet<TRow>;
}

export const buildErkhetConfigBaseColumns = <TRow extends TErkhetConfigRow>({
  t,
  onDelete,
  editLoading,
  renderEditSheet,
}: ErkhetConfigColumnsArgs<TRow>): ColumnDef<TRow>[] => [
  {
    id: 'more',
    cell: (cell: CellContext<TRow, unknown>) => (
      <ErkhetConfigMoreCell
        cell={cell}
        onDelete={onDelete}
        editLoading={editLoading}
        renderEditSheet={(open, onOpenChange) =>
          renderEditSheet(cell.row.original, open, onOpenChange)
        }
      />
    ),
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<TRow>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconAlignLeft} label={t('title')} />
    ),
    cell: ({ row }) => (
      <ErkhetConfigTitleCell
        config={row.original}
        renderEditSheet={(open, onOpenChange) =>
          renderEditSheet(row.original, open, onOpenChange)
        }
      />
    ),
    size: 200,
  },
];

interface ErkhetConfigTextColumnArgs<TRow> {
  t: TFunction;
  id: Extract<keyof TRow, string>;
  icon: Icon;
  labelKey: string;
  size?: number;
  format?: (value: string) => string;
}

export const erkhetConfigTextColumn = <TRow extends TErkhetConfigRow>({
  t,
  id,
  icon,
  labelKey,
  size = 200,
  format,
}: ErkhetConfigTextColumnArgs<TRow>): ColumnDef<TRow> => ({
  id,
  accessorKey: id,
  header: () => <RecordTable.InlineHead icon={icon} label={t(labelKey)} />,
  cell: ({ cell }) => {
    const value = (cell.getValue() as string) || '';
    return (
      <RecordTableInlineCell>
        {format ? format(value) : value || '—'}
      </RecordTableInlineCell>
    );
  },
  size,
});
