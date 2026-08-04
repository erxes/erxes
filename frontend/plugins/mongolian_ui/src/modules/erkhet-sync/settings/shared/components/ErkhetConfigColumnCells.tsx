import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CellContext } from '@tanstack/react-table';
import { Button, Combobox, Command, Popover, RecordTable, RecordTableInlineCell, useConfirm } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TitleCellProps<TRow extends { _id: string; title?: string }> {
  config: TRow;
  renderEditSheet: (open: boolean, onOpenChange: (v: boolean) => void) => ReactNode;
}

export const ErkhetConfigTitleCell = <TRow extends { _id: string; title?: string }>({
  config,
  renderEditSheet,
}: TitleCellProps<TRow>) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordTableInlineCell className="cursor-pointer font-medium" onClick={() => setOpen(true)}>
        {config.title || '—'}
      </RecordTableInlineCell>
      {open && renderEditSheet(open, setOpen)}
    </>
  );
};

interface MoreCellProps<TRow extends { _id: string }> {
  cell: CellContext<TRow, unknown>;
  onDelete: (id: string) => void;
  editLoading: boolean;
  renderEditSheet: (open: boolean, onOpenChange: (v: boolean) => void) => ReactNode;
}

export const ErkhetConfigMoreCell = <TRow extends { _id: string }>({
  cell,
  onDelete,
  editLoading,
  renderEditSheet,
}: MoreCellProps<TRow>) => {
  const [editOpen, setEditOpen] = useState(false);
  const config = cell.row.original;
  const { confirm } = useConfirm();
  const { t } = useTranslation('mongolian');

  const handleDelete = () => {
    confirm({ message: t('delete-this-config-confirm') }).then(
      () => onDelete(config._id),
    );
  };

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton className="w-full h-full" />
        </Popover.Trigger>
        <Combobox.Content
          align="start"
          className="w-[180px] min-w-0 [&>button]:cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <Command>
            <Command.List>
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8"
                  onClick={() => setEditOpen(true)}
                >
                  <IconEdit className="size-4" />
                  {t('edit')}
                </Button>
              </Command.Item>
              <Command.Item asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  disabled={editLoading}
                >
                  <IconTrash className="size-4" />
                  {t('delete')}
                </Button>
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>
      {editOpen && renderEditSheet(editOpen, setEditOpen)}
    </>
  );
};
