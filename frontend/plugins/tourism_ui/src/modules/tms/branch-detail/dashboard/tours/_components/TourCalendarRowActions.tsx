import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu, Spinner } from 'erxes-ui';

interface TourCalendarRowActionsProps {
  deleting?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}

export const TourCalendarRowActions = ({
  deleting = false,
  onDelete,
  onEdit,
}: TourCalendarRowActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-7"
          aria-label="Tour actions"
        >
          <IconDotsVertical size={16} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="w-24 min-w-0">
        <DropdownMenu.Item onClick={onEdit}>
          <IconEdit size={16} />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={onDelete}
          disabled={deleting}
          className="text-destructive"
        >
          {deleting ? <Spinner className="size-4" /> : <IconTrash size={16} />}
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
