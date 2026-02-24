import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  RelativeDateDisplay,
  Popover,
  useToast,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { categoryMoreColumn } from './CategoriesMoreColumn';
import { useState } from 'react';
import {
  IconUser,
  IconArticle,
  IconFolder,
  IconId,
  IconCalendarPlus,
} from '@tabler/icons-react';
import { ICategory } from '../types/CategoriesType';
import { useEditCategory } from '../hooks/useEditCategory';

const BadgeCell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
    <span className="text-sm text-gray-500">{children}</span>
  </div>
);

export const createCategoriesColumns = (
  clientPortalId: string,
  onEdit?: (category: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editCategory } = useEditCategory();
  const { toast } = useToast();

  return [
    categoryMoreColumn(clientPortalId, onEdit, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as ICategory;
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
              <span>{cell.getValue() as string}</span>
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
          if (!parent) return '—';
          // If there's a parent with a name, return it
          if (parent.name) return parent.name;
          // If there's a nested parent, recursively get its name
          if (parent.parent) return getParentName(parent.parent);
          return '—';
        };

        const parentName = getParentName(row.original.parent);

        return <BadgeCell>{parentName}</BadgeCell>;
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
    {
      id: '_id',
      header: () => <RecordTable.InlineHead icon={IconId} label="ID" />,
      accessorKey: '_id',
      cell: ({ cell }) => {
        const id = cell.getValue() as string;
        const handleCopyId = () => {
          navigator.clipboard.writeText(id);
          toast({
            title: 'Copied',
            description: 'ID copied to clipboard',
            variant: 'success',
          });
        };

        return (
          <BadgeCell>
            <button
              onClick={handleCopyId}
              className="hover:text-blue-600 cursor-pointer text-xs font-mono"
              title="Copy ID"
            >
              {id}
            </button>
          </BadgeCell>
        );
      },
    },
  ];
};
