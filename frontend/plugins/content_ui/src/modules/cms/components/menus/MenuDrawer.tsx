import { useMutation, useQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CMS_MENU_ADD, CMS_MENU_EDIT, CMS_MENU_LIST } from '../../graphql/queries';
import { buildFlatTree, getDepthPrefix } from './menuUtils';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientPortalId: string;
  menu?: {
    _id: string;
    label: string;
    url?: string;
    kind?: string;
    parentId?: string;
  };
}

interface MenuFormData {
  label: string;
  url: string;
  kind: string;
  clientPortalId: string;
  parentId: string;
}

export function MenuDrawer({ isOpen, onClose, onSuccess, clientPortalId, menu }: MenuDrawerProps) {
  const [hasPermissionError, setHasPermissionError] = useState(false);
  const isEditing = !!menu?._id;

  const form = useForm<MenuFormData>({
    defaultValues: {
      label: '',
      url: '',
      kind: '',
      clientPortalId,
      parentId: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        label: menu?.label || '',
        url: menu?.url || '',
        kind: menu?.kind || '',
        clientPortalId,
        parentId: menu?.parentId || '',
      });
      setHasPermissionError(false);
    }
  }, [isOpen, clientPortalId, menu]);

  const { data: menusData } = useQuery(CMS_MENU_LIST, {
    variables: { clientPortalId, limit: 100 },
    skip: !isOpen || !clientPortalId,
    fetchPolicy: 'cache-first',
  });

  const rawMenus: { _id: string; label: string; parentId?: string }[] =
    (menusData?.cmsMenuList || []).filter((m: any) => m._id !== menu?._id);

  const parentOptions = buildFlatTree(rawMenus).map((item) => ({
    _id: item._id,
    label: getDepthPrefix(item.depth) + item.label,
  }));

  const [addMenu, { loading: adding }] = useMutation(CMS_MENU_ADD, {
    onCompleted: () => {
      onClose();
      form.reset();
      onSuccess?.();
      toast({ title: 'Success', description: 'Menu created successfully', variant: 'default' });
    },
    onError: handleError,
  });

  const [editMenu, { loading: editing }] = useMutation(CMS_MENU_EDIT, {
    onCompleted: () => {
      onClose();
      onSuccess?.();
      toast({ title: 'Success', description: 'Menu updated successfully', variant: 'default' });
    },
    onError: handleError,
  });

  function handleError(error: any) {
    const permissionError = error.graphQLErrors?.some(
      (e: any) => e.message === 'Permission required' || e.extensions?.code === 'INTERNAL_SERVER_ERROR',
    );

    if (permissionError) {
      setHasPermissionError(true);
      toast({
        title: 'Permission Required',
        description:
          'You do not have permission to manage menus. Please contact your administrator.',
        variant: 'destructive',
        duration: 8000,
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save menu. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }

  const saving = adding || editing;

  const onSubmit = (data: MenuFormData) => {
    const input: Record<string, any> = {
      clientPortalId: data.clientPortalId,
      label: data.label,
      url: data.url,
      kind: data.kind,
    };

    if (data.parentId && data.parentId !== 'none') {
      input.parentId = data.parentId;
    }

    if (isEditing) {
      editMenu({ variables: { _id: menu!._id, input } });
    } else {
      addMenu({ variables: { input } });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit Menu' : 'New Menu'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-4">
            {hasPermissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Permission Required</p>
                    <p className="text-red-700 mt-1">
                      You need permission to manage menus. Please contact your administrator.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form.Field
              control={form.control}
              name="label"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Label</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter label" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="url"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>URL</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="/path-or-https://..." required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="kind"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Kind</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select kind" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="header">Header</Select.Item>
                        <Select.Item value="footer">Footer</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Parent Menu</Form.Label>
                  <Form.Control>
                    <Select value={field.value || 'none'} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="None (top-level)" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="none">None (top-level)</Select.Item>
                        {parentOptions.map((opt) => (
                          <Select.Item key={opt._id} value={opt._id}>
                            {opt.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={saving || hasPermissionError}>
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Menu'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
