import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  Popover,
  useToast,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { tagMoreColumn } from './TagsMoreColumn';
import { useState } from 'react';
import { IconTag, IconCalendar, IconId } from '@tabler/icons-react';
import { CmsTag } from '../types/tagTypes';
import { useEditTag } from '../hooks/useEditTag';

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

export const createTagsColumns = (
  clientPortalId: string,
  onEdit?: (tag: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editTag } = useEditTag();
  const { toast } = useToast();

  return [
    tagMoreColumn(clientPortalId, onEdit, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as CmsTag;
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
            await editTag(original._id, {
              name: currentValue,
              slug: original.slug,
              clientPortalId: original.clientPortalId,
              colorCode: original.colorCode,
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
              <div className="flex items-center gap-2">
                <div
                  className="size-2 rounded-full"
                  style={{ backgroundColor: original.colorCode || '#ddd' }}
                />
                <span>{cell.getValue() as string}</span>
              </div>
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
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconTag} label="Slug" />,
      accessorKey: 'slug',
      cell: ({ cell }) => (
        <div className="w-full flex px-2 items-center text-gray-500">
          {(cell.getValue() as string) || '—'}
        </div>
      ),
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
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
