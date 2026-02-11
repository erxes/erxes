import { useMutation } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CMS_MENU_ADD, CMS_MENU_LIST } from '../../graphql/queries';

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
}

interface MenuFormData {
  label: string;
  url: string;
  kind: string;
  clientPortalId: string;
}

export function MenuDrawer({ isOpen, onClose, clientPortalId }: MenuDrawerProps) {
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const form = useForm<MenuFormData>({
    defaultValues: {
      label: '',
      url: '',
      kind: '',
      clientPortalId,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({ label: '', url: '', kind: '', clientPortalId });
      setHasPermissionError(false);
    }
  }, [isOpen, clientPortalId]);

  const [addMenu, { loading: saving }] = useMutation(CMS_MENU_ADD, {
    refetchQueries: [
      {
        query: CMS_MENU_LIST,
        variables: {
          clientPortalId,
          limit: 50,
        },
      },
    ],
    onCompleted: () => {
      onClose();
      form.reset();
      toast({ title: 'Success', description: 'Menu created successfully', variant: 'default' });
    },
    onError: (error) => {
      const permissionError = error.graphQLErrors?.some(
        (e) => e.message === 'Permission required' || e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: 'Permission Required',
          description:
            'You do not have permission to create menus. Please contact your administrator to grant the necessary permissions.',
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create menu. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const onSubmit = (data: MenuFormData) => {
    const input = {
      clientPortalId: data.clientPortalId,
      label: data.label,
      url: data.url,
      kind: data.kind,
    };

    addMenu({ variables: { input } });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>New Menu</Sheet.Title>
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
                      You need permission to create menus. Please contact your administrator to grant the necessary permissions.
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
                    <Input {...field} placeholder="e.g. header, footer" />
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
                {saving ? 'Creating...' : 'Create Menu'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
