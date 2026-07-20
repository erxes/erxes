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
      <Combobox.Content
        align="start"
        className="w-[280px] min-w-0 [&>button]:cursor-pointer"
        onClick={(event) => event.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item value="edit" onSelect={onEdit}>
              <IconEdit /> {editLabel}
            </Command.Item>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8"
                onClick={onDelete}
                disabled={deleteLoading}
              >
                <IconTrash className="size-4" />
                {deleteLabel}
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
    {children}
  </>
);
