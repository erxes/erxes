import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  Popover,
  useToast,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { customTypeMoreColumn } from './CustomTypesMoreColumn';
import { useState } from 'react';
import {
  IconLayout,
  IconCalendar,
  IconId,
  IconArticle,
} from '@tabler/icons-react';
import { ICustomPostType } from '../types/customTypeTypes';
import { useEditCustomType } from '../hooks/useEditCustomType';

const BadgeCell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
    <span className="text-sm text-gray-500">{children}</span>
  </div>
);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const createCustomTypesColumns = (
  websiteId: string,
  onEdit?: (customType: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editType } = useEditCustomType(onRefetch);
  const { toast } = useToast();

  return [
    customTypeMoreColumn(onEdit, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => (
        <RecordTable.InlineHead icon={IconLayout} label="Type Name" />
      ),
      accessorKey: 'label',
      cell: ({ cell }) => {
        const original = cell.row.original as ICustomPostType;
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
          if (currentValue !== (original.label || '')) {
            await editType({
              variables: {
                _id: original._id,
                input: {
                  label: currentValue,
                  pluralLabel: original.pluralLabel,
                  code: original.code,
                  description: original.description,
                  clientPortalId: websiteId,
                },
              },
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
      size: 280,
    },
    {
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconArticle} label="Description" />
      ),
      accessorKey: 'description',
      cell: ({ cell }) => (
        <BadgeCell>{(cell.getValue() as string) || '—'}</BadgeCell>
      ),
      size: 360,
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
      ),
      accessorKey: 'createdAt',
      size: 120,
      cell: ({ cell }) => (
        <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
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
