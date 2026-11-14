import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import { Button, Command, Popover, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePermissionCheck } from 'ui-modules';
import { useRemovePackages } from '../../hooks/usePackageMutations';

// A package's actions in the side panel's top bar.
export const PackagePanelActions = ({
  packageId,
  onDeleted,
}: {
  packageId: string;
  onDeleted: () => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { hasActionPermission } = usePermissionCheck();
  const { removePackages, loading } = useRemovePackages();
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
      await removePackages({ variables: { _ids: [packageId] } });
      toast({ variant: 'success', title: t('packages-deleted') });
      onDeleted();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('delete-failed'),
        description: (error as Error).message,
      });
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
