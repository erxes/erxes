import { type Icon } from '@tabler/icons-react';
import { Cell, ColumnDef, DeepKeys } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ReactNode } from 'react';
import { KbInlineTextCell } from '@/knowledgebase/shared/components/KbInlineTextCell';

export const kbColumn = <T,>({
  id,
  size,
  label,
  icon,
  render,
}: {
  id: DeepKeys<T> & string;
  size: number;
  label: string;
  icon: Icon;
  render: (cell: Cell<T, unknown>) => ReactNode;
}): ColumnDef<T> => ({
  id,
  accessorKey: id,
  size,
  header: () => <RecordTable.InlineHead label={label} icon={icon} />,
  cell: ({ cell }) => render(cell),
});

export const kbDateColumn = <T,>(
  column: Omit<Parameters<typeof kbColumn<T>>[0], 'render' | 'size'>,
) =>
  kbColumn<T>({
    ...column,
    size: 160,
    render: (cell) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  });

export const kbCountColumn = <T,>({
  count,
  ...column
}: Omit<Parameters<typeof kbColumn<T>>[0], 'render' | 'size'> & {
  count: (row: T) => number;
}) =>
  kbColumn<T>({
    ...column,
    size: 140,
    render: (cell) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">{count(cell.row.original)}</Badge>
      </RecordTableInlineCell>
    ),
  });

export const KbTextCell = <T extends { _id: string }>({
  cell,
  scope,
  field,
  placeholder,
  onSave,
  children,
}: {
  cell: Cell<T, unknown>;
  scope: string;
  field: string;
  placeholder?: string;
  onSave: (next: string) => void;
  children?: ReactNode;
}) => (
  <KbInlineTextCell
    value={(cell.getValue() as string) || ''}
    placeholder={placeholder}
    scope={clsx(scope, cell.row.original._id, field)}
    onSave={onSave}
  >
    {children}
  </KbInlineTextCell>
);
