import {
  CoreFocusPanel,
  CoreModulePanel,
} from '@/side-panel/components/CoreModulePanel';
import { useTranslation } from 'react-i18next';
import { useAddPermissionGroup } from '@/settings/permissions/hooks/useAddPermissionGroup';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { Button, toast } from 'erxes-ui';
import React, { useCallback, useState } from 'react';
import { PermissionGroupForm } from '@/settings/permissions/components/form/PermissionGroupForm';

export const PermissionGroupAdd = ({
  text,
  defaultValues,
  trigger,
}: {
  text?: string;
  defaultValues?: Partial<IPermissionGroupSchema>;
  trigger?: React.ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'permissions' });
  const [open, setOpen] = useState<boolean>(false);

  const { addPermissionGroup, loading } = useAddPermissionGroup();

  const onSubmit = useCallback(
    async (data: IPermissionGroupSchema) => {
      if (loading) return;
      addPermissionGroup({
        variables: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          permissions: data.permissions,
        },
        onCompleted: () => {
          toast({ title: t('group-added'), variant: 'success' });
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: t('error-adding-group'),
            variant: 'destructive',
            description: error.message,
          });
        },
      });
    },
    [loading, addPermissionGroup, t],
  );

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <CoreFocusPanel
      name={'settings/permissions/form/PermissionGroupAdd'}
      open={open}
      onOpenChange={setOpen}
    >
      {trigger ? (
        <CoreModulePanel.Trigger asChild>{trigger}</CoreModulePanel.Trigger>
      ) : (
        <CoreModulePanel.Trigger asChild>
          <Button variant="secondary">{text || t('add-custom-group')}</Button>
        </CoreModulePanel.Trigger>
      )}
      <CoreFocusPanel.View>
        <CoreFocusPanel.Header
          title={defaultValues?.name ? t('edit-group') : t('add-custom-group')}
        />
        <CoreFocusPanel.Content>
          <PermissionGroupForm
            key={defaultValues?.name ?? 'new'}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={loading}
            onCancel={onCancel}
            mode="add"
          />
        </CoreFocusPanel.Content>
      </CoreFocusPanel.View>
    </CoreFocusPanel>
  );
};
