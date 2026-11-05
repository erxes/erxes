import { useTranslation } from 'react-i18next';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu, Spinner, useConfirm } from 'erxes-ui';
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

  const confirmRemove = () =>
    confirm({
      message,
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() => onRemove(close));

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={loading}
          aria-label={t('delete')}
        >
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <IconDotsVertical className="size-4" />
          )}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-48">
        <DropdownMenu.Item
          className="text-destructive"
          onSelect={confirmRemove}
        >
          <IconTrash className="size-4" />
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
