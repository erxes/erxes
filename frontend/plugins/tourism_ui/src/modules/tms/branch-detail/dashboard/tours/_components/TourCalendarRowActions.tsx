import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('tourism');
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
          {t('edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={onDelete}
          disabled={deleting}
          className="text-destructive"
        >
          {deleting ? <Spinner className="size-4" /> : <IconTrash size={16} />}
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
