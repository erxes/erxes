import { FocusSheet, Sheet, toast } from 'erxes-ui';
import { Button } from 'erxes-ui';
import React, { useState, useCallback } from 'react';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PermissionGroupForm } from './PermissionGroupForm';
import { useAddPermissionGroup } from '@/settings/permissions/hooks/useAddPermissionGroup';

export const PermissionGroupAdd = ({
  text,
  defaultValues,
  trigger,
}: {
  text?: string;
  defaultValues?: Partial<IPermissionGroupSchema>;
  trigger?: React.ReactNode;
}) => {
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
          toast({ title: 'Permission group added', variant: 'success' });
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Error adding permission group',
            variant: 'destructive',
            description: error.message,
          });
        },
      });
    },
    [loading, addPermissionGroup],
  );

  const onCancel = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <FocusSheet open={open} onOpenChange={setOpen}>
      {trigger ? (
        <Sheet.Trigger asChild>{trigger}</Sheet.Trigger>
      ) : (
        <Sheet.Trigger asChild>
          <Button variant="secondary">{text || 'Add Custom Group'}</Button>
        </Sheet.Trigger>
      )}
      <FocusSheet.View>
        <FocusSheet.Header
          title={defaultValues?.name ? 'Edit Group' : 'Add Custom Group'}
        />
        <FocusSheet.Content>
          <PermissionGroupForm
            key={defaultValues?.name ?? 'new'}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            isSubmitting={loading}
            onCancel={onCancel}
            mode="add"
          />
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
