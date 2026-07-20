import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
} from 'erxes-ui';
import { ReactNode } from 'react';

export const LoyaltyMoreActions = ({
  editLabel,
  deleteLabel,
  deleteLoading,
  onEdit,
  onDelete,
  children,
}: {
  editLabel: string;
  deleteLabel: string;
  deleteLoading?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  children?: ReactNode;
}) => (
  <>
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Popover.Content
        align="start"
        className="w-[280px] min-w-0 [&>button]:cursor-pointer"
        onClick={(event) => event.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item value="edit" onSelect={onEdit}>
              <IconEdit className="size-4" /> {editLabel}
            </Command.Item>
            <Command.Item value="delete" onSelect={onDelete} disabled={deleteLoading}>
              <IconTrash className="size-4" />
              {deleteLabel}
            </Command.Item>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
    {children}
  </>
);
