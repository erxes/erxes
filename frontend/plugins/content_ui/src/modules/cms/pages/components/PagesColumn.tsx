import { RecordTable, RecordTableInlineCell, Input, Popover } from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { pageMoreColumn } from './PagesMoreColumn';
import { useState } from 'react';
import { IconUser, IconArticle, IconCalendar } from '@tabler/icons-react';
import { IPage } from '../types/pageTypes';
import { useEditPage } from '../hooks/useEditPage';

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

export const pagesColumns = (
  onEditPage?: (page: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editPage } = useEditPage();

  return [
    pageMoreColumn(onEditPage, undefined, onRefetch),
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'name',
      header: () => <RecordTable.InlineHead icon={IconUser} label="Name" />,
      accessorKey: 'name',
      cell: ({ cell }) => {
        const original = cell.row.original as IPage;
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
            await editPage({
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
      id: 'slug',
      header: () => <RecordTable.InlineHead icon={IconArticle} label="Slug" />,
      accessorKey: 'slug',
      cell: ({ cell }) => (
        <BadgeCell>{(cell.getValue() as string) || ''}</BadgeCell>
      ),
    },

    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Created" />
      ),
      accessorKey: 'createdAt',
      cell: ({ cell }) => (
        <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
      ),
    },
    {
      id: 'updatedAt',
      header: () => (
        <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
      ),
      accessorKey: 'updatedAt',
      cell: ({ cell }) => (
        <BadgeCell>{formatDate(cell.getValue() as string)}</BadgeCell>
      ),
    },
  ];
};
