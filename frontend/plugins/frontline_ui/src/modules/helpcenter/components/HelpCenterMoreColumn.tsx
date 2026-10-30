import { HELP_CENTER_CONTENT_TYPE } from '@/helpcenter/constants';
import { useSidePanel } from 'ui-modules';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfirmRemoveHelpCenter } from '@/helpcenter/hooks/useConfirmRemoveHelpCenter';
import { IHelpCenter } from '@/helpcenter/types';

export const HelpCenterMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IHelpCenter, unknown>;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.helpcenter',
  });
  const { _id, title } = cell.row.original;
  const { openRecord } = useSidePanel();
  const { confirmRemoveHelpCenter, loading } = useConfirmRemoveHelpCenter();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);

    return confirmRemoveHelpCenter({ _id, title });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" disabled={loading} />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => {
                setOpen(false);
                openRecord({
                  contentType: HELP_CENTER_CONTENT_TYPE,
                  contentId: _id,
                });
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
