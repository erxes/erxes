import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  RelativeDateDisplay,
  Popover,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { categoryMoreColumn } from './CategoriesMoreColumn';
import { useState } from 'react';
import {
  IconUser,
  IconArticle,
  IconFolder,
  IconCalendarPlus,
} from '@tabler/icons-react';
import { ICategory } from '../types/CategoriesType';
import { useEditCategory } from '../hooks/useEditCategory';

function getDepthPrefix(depth: number): string {
  if (depth === 0) return '';
  if (depth === 1) return '- ';
  return '-- ';
}

export const createCategoriesColumns = (
  clientPortalId: string,
  onEdit?: (category: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editCategory } = useEditCategory();

  return [
    categoryMoreColumn(clientPortalId, onEdit, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as ICategory & { _depth?: number };
        const [editingCell, setEditingCell] = useState<{
          rowId: string;
          value: string;
        } | null>(null);
        const isOpen = editingCell?.rowId === original._id;
        const currentValue =
          editingCell?.rowId === original._id && editingCell
            ? editingCell.value
            : (cell.getValue() as string);

        const onSave = async () => {
          if (currentValue !== (original.name || '')) {
            await editCategory({
              variables: { _id: original._id, input: { name: currentValue } },
            });
          }
          setEditingCell(null);
        };

        const prefix = getDepthPrefix(original._depth ?? 0);

        return (
          <Popover
            open={isOpen}
            onOpenChange={(v) => {
              if (v) {
                setEditingCell({
                  rowId: original._id,
                  value: cell.getValue() as string,
                });
              } else {
                onSave();
              }
            }}
          >
            <RecordTableInlineCell.Trigger>
              <span>
                {prefix}
                {cell.getValue() as string}
              </span>
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content>
              <Input
                value={currentValue}
                onChange={(e) =>
                  setEditingCell({
                    rowId: original._id,
                    value: e.currentTarget.value,
                  })
                }
              />
            </RecordTableInlineCell.Content>
          </Popover>
        );
      },
    },
    {
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconArticle} label="Description" />
      ),
      accessorKey: 'description',
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'parent',
      header: () => <RecordTable.InlineHead icon={IconFolder} label="Parent" />,
      accessorKey: 'parentId',
      cell: ({ row }) => {
        const getParentName = (parent: any): string => {
          if (!parent) return '';
          // If there's a parent with a name, return it
          if (parent.name) return parent.name;
          // If there's a nested parent, recursively get its name
          if (parent.parent) return getParentName(parent.parent);
          return '';
        };

        const parentName = getParentName(row.original.parent);

        return <RecordTableInlineCell>{parentName}</RecordTableInlineCell>;
      },
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendarPlus} label="Created At" />
      ),
      accessorKey: 'createdAt',
      size: 120,
      cell: ({ cell }) => (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      ),
    },
  ];
};
