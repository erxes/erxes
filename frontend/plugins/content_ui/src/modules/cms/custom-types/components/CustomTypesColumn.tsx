import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  Popover,
  RelativeDateDisplay,
  TextOverflowTooltip,
} from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { customTypeMoreColumn } from './CustomTypesMoreColumn';
import { useState } from 'react';
import {
  IconLayout,
  IconCalendar,
  IconArticle,
} from '@tabler/icons-react';
import { ICustomPostType } from '../types/customTypeTypes';
import { useEditCustomType } from '../hooks/useEditCustomType';

export const createCustomTypesColumns = (
  websiteId: string,
  onEdit?: (customType: any) => void,
  onRefetch?: () => void,
): ColumnDef<any>[] => {
  const { editType } = useEditCustomType(onRefetch);

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
    },
    {
      id: 'description',
      header: () => (
        <RecordTable.InlineHead icon={IconArticle} label="Description" />
      ),
      accessorKey: 'description',
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
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
  ];
};
