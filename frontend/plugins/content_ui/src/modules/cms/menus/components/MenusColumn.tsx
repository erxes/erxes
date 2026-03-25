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
import { useIsTranslationMissing } from '../../shared/hooks/useIsTranslationMissing';

const BADGE_CLASS =
  'mx-2 my-1 p-1 inline-flex items-center rounded-sm px-2 whitespace-nowrap font-medium w-fit h-6 text-xs border gap-1 bg-accent';

interface MoreCellProps {
  row: any;
  onEdit: (menu: any) => void;
  refetch: () => void;
}

const MoreCell = ({ row, onEdit, refetch }: MoreCellProps) => {
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
};

interface LabelCellProps {
  cell: any;
  refetch: () => void;
  isMissing: (translations?: { language: string }[]) => boolean;
}

const LabelCell = ({ cell, refetch, isMissing }: LabelCellProps) => {
  const original = cell.row.original as any;
  const missing = isMissing(original.translations);
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
        <span className={missing ? 'text-red-500' : ''}>
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
};

export const useMenusColumns = (
  onEdit: (menu: any) => void,
  refetch: () => void,
): ColumnDef<Record<string, unknown>>[] => {
  const { isMissing } = useIsTranslationMissing();

  return [
    {
      id: 'more',
      header: () => <span className="sr-only">More</span>,
      cell: ({ row }) => (
        <MoreCell row={row} onEdit={onEdit} refetch={refetch} />
      ),
      size: 40,
    },
    RecordTable.checkboxColumn as ColumnDef<any>,
    {
      id: 'label',
      header: () => <RecordTable.InlineHead icon={IconList} label="Label" />,
      accessorKey: 'label',
      cell: ({ cell }) => (
        <LabelCell cell={cell} refetch={refetch} isMissing={isMissing} />
      ),
      size: 280,
    },
    {
      id: 'url',
      header: () => <RecordTable.InlineHead icon={IconLink} label="URL" />,
      accessorKey: 'url',
      cell: ({ cell }) => (
        <div className={BADGE_CLASS}>
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
        <div className={BADGE_CLASS}>
          <span className="text-sm text-gray-500">
            {(cell.getValue() as string) || ''}
          </span>
        </div>
      ),
      size: 140,
    },
  ];
};
