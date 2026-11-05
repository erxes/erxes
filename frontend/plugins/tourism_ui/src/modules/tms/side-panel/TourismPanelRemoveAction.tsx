import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { Button, Command, Popover, Spinner, useConfirm } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

export const TourismPanelRemoveAction = ({
  message,
  loading,
  onRemove,
}: {
  message: string;
  loading: boolean;
  onRemove: (onCompleted: () => void) => void;
}) => {
  const { t } = useTranslation('tourism');
  const { confirm } = useConfirm();
  const { close } = useSidePanel();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);
    confirm({
      message,
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => onRemove(close));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={loading}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconDotsVertical className="size-4" />
          )}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="min-w-[280px] p-0" align="end">
        <Command>
          <Command.List className="p-0">
            <Command.Group className="p-1">
              <Command.Item
                value="delete"
                className="text-destructive"
                onSelect={handleDelete}
              >
                <div className="flex gap-2 items-center">
                  <IconTrash className="size-4" />
                  {t('delete')}
                </div>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
