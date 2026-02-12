import { FocusSheet, Sheet, toast } from 'erxes-ui';
import { Button } from 'erxes-ui';
import { useState, useCallback } from 'react';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PermissionGroupForm } from './PermissionGroupForm';
import { useEditPermissionGroup } from '@/settings/permissions/hooks/useEditPermissionGroup';
import { IPermissionGroup } from '@/settings/permissions/types';

export const PermissionGroupEdit = ({
  group,
  trigger,
}: {
  group: IPermissionGroup;
  trigger?: React.ReactNode;
}) => {
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
          toast({ title: 'Permission group updated', variant: 'success' });
          setOpen(false);
        },
        onError: (error) => {
          toast({
            title: 'Error updating permission group',
            variant: 'destructive',
            description: error.message,
          });
        },
      });
    },
    [loading, editPermissionGroup, group._id],
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
            Edit
          </Button>
        </Sheet.Trigger>
      )}
      <FocusSheet.View>
        <FocusSheet.Header title="Edit Permission Group" />
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
