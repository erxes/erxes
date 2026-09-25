import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useQueryState,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRemoveHelpCenters } from '@/helpcenter/hooks/useRemoveHelpCenters';
import { IHelpCenter } from '@/helpcenter/types';

export const HelpCenterMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IHelpCenter, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const [, setEditId] = useQueryState<string>('editId');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeHelpCenters } = useRemoveHelpCenters();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);

    confirm({
      message: t('kb-confirm-delete-topic', {
        title: title || t('unnamed-topic'),
      }),
    }).then(async () => {
      try {
        await removeHelpCenters([_id]);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('kb-topic-deleted', 'Help center deleted'),
        });
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                setEditId(_id);
              }}
            >
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const helpCenterMoreColumn: ColumnDef<IHelpCenter> = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: HelpCenterMoreColumnCell,
  size: 33,
};
