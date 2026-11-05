import { IconEdit, IconTrash, type Icon } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type TKbRowAction = {
  value: string;
  icon: Icon;
  label: string;
  onSelect: () => void;
};

export const KbRowActions = ({
  onEdit,
  actions = [],
  onDelete,
}: {
  onEdit: () => void;
  actions?: TKbRowAction[];
  onDelete: () => void;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.knowledgebase',
  });
  const [open, setOpen] = useState(false);

  const items: TKbRowAction[] = [
    ...actions,
    {
      value: 'edit',
      icon: IconEdit,
      label: t('edit'),
      onSelect: onEdit,
    },
    {
      value: 'delete',
      icon: IconTrash,
      label: t('delete'),
      onSelect: onDelete,
    },
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            {items.map((item) => (
              <Command.Item
                key={item.value}
                value={item.value}
                onSelect={() => {
                  setOpen(false);
                  item.onSelect();
                }}
              >
                <item.icon /> {item.label}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const kbMoreColumn = <T,>(
  cell: (props: { cell: Cell<T, unknown> }) => ReactNode,
): ColumnDef<T> => ({
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell,
  size: 33,
});
