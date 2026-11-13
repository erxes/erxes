import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { Button, Command, Popover, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { useRemoveSimilarity } from '../../hooks/useRemoveSimilarity';

// A similarity group's actions in the side panel's top bar. Deleting the
// group keeps its generated products.
export const SimilarityPanelActions = ({
  similarityId,
  onDeleted,
}: {
  similarityId: string;
  onDeleted: () => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { confirm } = useConfirm();
  const { hasActionPermission } = usePermissionCheck();
  const { remove, loading } = useRemoveSimilarity();
  const [open, setOpen] = useState(false);

  if (!hasActionPermission('productsDelete')) {
    return null;
  }

  const handleDelete = async () => {
    setOpen(false);
    try {
      await confirm({
        message: t('confirm-delete', { count: 1 }),
        options: { confirmationValue: 'delete' },
      });
    } catch {
      return;
    }
    try {
      await remove(similarityId);
      onDeleted();
    } catch {
      // The remove hook has shown the error.
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t('actions', 'Actions')}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="min-w-48 p-0" align="end">
        <Command>
          <Command.List className="p-1">
            <Command.Item
              className="text-destructive"
              disabled={loading}
              onSelect={handleDelete}
            >
              <IconTrash className="size-4" />
              {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
