import { useState } from 'react';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import {
  IconArchive,
  IconEdit,
  IconTool,
  IconTrash,
} from '@tabler/icons-react';

export const ViberIntegrationActions = ({
  archived,
  disabled,
  canEdit,
  canRemove,
  onEdit,
  onAction,
}: {
  archived: boolean;
  disabled: boolean;
  canEdit: boolean;
  canRemove: boolean;
  onEdit: () => void;
  onAction: (action: 'repair' | 'archive' | 'remove') => void;
}) => {
  const [open, setOpen] = useState(false);
  const select = (action: () => void): void => {
    setOpen(false);
    action();
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton
          disabled={disabled}
          aria-label="Integration actions"
          className="w-full h-full"
        />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => select(onEdit)}>
              <IconEdit size={16} />
              {canEdit ? 'Edit' : 'View details'}
            </Command.Item>
            {canEdit && (
              <>
                <Command.Item
                  value="repair"
                  onSelect={() => select(() => onAction('repair'))}
                >
                  <IconTool size={16} />
                  Repair
                </Command.Item>
                <Command.Item
                  value="archive"
                  onSelect={() => select(() => onAction('archive'))}
                >
                  <IconArchive size={16} />
                  {archived ? 'Restore' : 'Archive'}
                </Command.Item>
              </>
            )}
            {canRemove && (
              <Command.Item
                value="remove"
                onSelect={() => select(() => onAction('remove'))}
                className="text-destructive"
              >
                <IconTrash size={16} />
                Remove
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
