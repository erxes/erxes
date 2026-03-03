import { TemplateCategory } from '@/templates/types/TemplateCategory';
import { IconLabelFilled } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
} from 'erxes-ui';

export const templateCategoryColumns: ColumnDef<any>[] = [
  RecordTable.checkboxColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => (
      <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <RecordTableTree.Trigger
            order={cell.row.original.order}
            name={cell.getValue() as string}
            hasChildren={cell.row.original.hasChildren}
          >
            <Badge variant="secondary">{cell.getValue() as string}</Badge>
          </RecordTableTree.Trigger>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => (
      <RecordTable.InlineHead label="Code" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'templateCount',
    accessorKey: 'templateCount',
    header: () => (
      <RecordTable.InlineHead label="Template Count" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'parent',
    accessorKey: 'parent',
    header: () => (
      <RecordTable.InlineHead label="Parent" icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => {
      const parent = (cell.getValue() || {}) as TemplateCategory;

      return <RecordTableInlineCell>{parent?.name}</RecordTableInlineCell>;
    },
  },
];
