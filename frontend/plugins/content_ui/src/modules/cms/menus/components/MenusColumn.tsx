import { ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  Input,
  Popover,
  Combobox,
  Command,
} from 'erxes-ui';
import {
  IconList,
  IconLink,
  IconArticle,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useConfirm } from 'erxes-ui/hooks/use-confirm';
import { useMutation } from '@apollo/client';
import { CMS_MENU_EDIT, CMS_MENU_REMOVE } from '../../graphql/queries';
import { getDepthPrefix } from '../menuUtils';

export const createMenusColumns = (
  onEdit: (menu: any) => void,
  refetch: () => void,
): ColumnDef<any>[] => [
  {
    id: 'more',
    header: () => <span className="sr-only">More</span>,
    cell: ({ row }) => {
      const { confirm } = useConfirm();
      const [removeMenu] = useMutation(CMS_MENU_REMOVE);

      const handleEdit = () => onEdit(row.original);
      const handleRemove = () => {
        confirm({
          message: 'Are you sure you want to delete this menu?',
        }).then(async () => {
          await removeMenu({ variables: { _id: row.original._id } });
          refetch();
        });
      };

      return (
        <Popover>
          <Popover.Trigger asChild>
            <RecordTable.MoreButton className="w-full h-full" />
          </Popover.Trigger>
          <Combobox.Content>
            <Command shouldFilter={false}>
              <Command.List>
                <Command.Item value="edit" onSelect={handleEdit}>
                  <IconEdit /> Edit
                </Command.Item>
                <Command.Item value="remove" onSelect={handleRemove}>
                  <IconTrash /> Remove
                </Command.Item>
              </Command.List>
            </Command>
          </Combobox.Content>
        </Popover>
      );
    },
    size: 40,
  },
  RecordTable.checkboxColumn as ColumnDef<any>,
  {
    id: 'label',
    header: () => <RecordTable.InlineHead icon={IconList} label="Label" />,
    accessorKey: 'label',
    cell: ({ cell }) => {
      const original = cell.row.original as any;
      const [open, setOpen] = useState(false);
      const [label, setLabel] = useState<string>(cell.getValue() as string);
      const [editMenu] = useMutation(CMS_MENU_EDIT);

      const onSave = async () => {
        if ((label || '') !== (original.label || '')) {
          await editMenu({
            variables: { _id: original._id, input: { label } },
          });
          refetch();
        }
      };

      return (
        <Popover
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) onSave();
          }}
        >
          <RecordTableInlineCell.Trigger>
            <span>
              {getDepthPrefix(original.depth) + (cell.getValue() as string)}
            </span>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input
              value={label}
              onChange={(e) => setLabel(e.currentTarget.value)}
            />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 280,
  },
  {
    id: 'url',
    header: () => <RecordTable.InlineHead icon={IconLink} label="URL" />,
    accessorKey: 'url',
    cell: ({ cell }) => (
      <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
        <span className="text-sm text-gray-500">
          {(cell.getValue() as string) || ''}
        </span>
      </div>
    ),
    size: 260,
  },
  {
    id: 'kind',
    header: () => <RecordTable.InlineHead icon={IconArticle} label="Kind" />,
    accessorKey: 'kind',
    cell: ({ cell }) => (
      <div className="mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent">
        <span className="text-sm text-gray-500">
          {(cell.getValue() as string) || ''}
        </span>
      </div>
    ),
    size: 140,
  },
];
