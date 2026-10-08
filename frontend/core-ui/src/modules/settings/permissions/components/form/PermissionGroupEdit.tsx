import { useTranslation } from 'react-i18next';
import { useEditPermissionGroup } from '@/settings/permissions/hooks/useEditPermissionGroup';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { IPermissionGroup } from '@/settings/permissions/types';
import { Button, FocusSheet, Sheet, toast } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { PermissionGroupForm } from './PermissionGroupForm';

export const PermissionGroupEdit = ({
  group,
  trigger,
}: {
  group: IPermissionGroup;
  trigger?: React.ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const [open, setOpen] = useState<boolean>(false);

  const { editPermissionGroup, loading } = useEditPermissionGroup();

  const onSubmit = useCallback(
    async (data: IPermissionGroupSchema) => {
      if (loading) return;
      editPermissionGroup({
        variables: {
          _id: group._id,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          permissions: data.permissions,
        },
        onCompleted: () => {
          toast({ title: t('group-updated'), variant: 'success' });
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: t('error-updating-group'),
            variant: 'destructive',
            description: error.message,
          });
        },
      });
    },
    [loading, editPermissionGroup, group._id, t],
  );

  const defaultValues: Partial<IPermissionGroupSchema> = {
    name: group.name,
    description: group.description || '',
    permissions: group.permissions,
  };

  return (
    <FocusSheet open={open} onOpenChange={setOpen}>
      {trigger ? (
        <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>
      ) : (
        <Sheet.Trigger asChild>
          <Button variant="ghost" size="sm">
            {t('edit')}
          </Button>
        </Sheet.Trigger>
      )}
      <FocusSheet.View>
        <FocusSheet.Header title={t('edit-permission-group')} />
        <FocusSheet.Content>
          <PermissionGroupForm
            key={group._id}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            onCancel={() => setOpen(false)}
            isSubmitting={loading}
            mode="edit"
          />
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
