import { useMutation } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { PAGES_ADD, PAGE_LIST, PAGES_EDIT } from '../../graphql/queries';

interface PageDrawerProps {
  page?: any;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
}

interface PageFormData {
  name: string;
  path: string;
  description?: string;
  status: string;
  clientPortalId: string;
}

export function PageDrawer({ page, isOpen, onClose, clientPortalId }: PageDrawerProps) {
  const isEditing = !!page;
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const form = useForm<PageFormData>({
    defaultValues: {
      name: '',
      path: '',
      description: '',
      status: 'active',
      clientPortalId,
    },
  });

  const [editPage, { loading: savingEdit }] = useMutation(PAGES_EDIT, {
    refetchQueries: [
      {
        query: PAGE_LIST,
        variables: {
          clientPortalId,
          limit: 20,
        },
      },
    ],
    onCompleted: () => {
      onClose();
      form.reset();
      toast({ title: 'Success', description: 'Page updated successfully', variant: 'default' });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update page. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (page) {
      form.reset({
        name: page.name || '',
        path: page.slug || '',
        description: page.description || '',
        status: page.status || 'active',
        clientPortalId: page.clientPortalId || clientPortalId,
      });
    } else {
      form.reset({
        name: '',
        path: '',
        description: '',
        status: 'active',
        clientPortalId,
      });
    }
    setHasPermissionError(false);
  }, [page, form, isOpen, clientPortalId]);

  const [addPage, { loading: savingAdd } ] = useMutation(PAGES_ADD, {
    refetchQueries: [
      {
        query: PAGE_LIST,
        variables: {
          clientPortalId,
          limit: 20,
        },
      },
    ],
    onCompleted: () => {
      onClose();
      form.reset();
      toast({ title: 'Success', description: 'Page created successfully', variant: 'default' });
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
            'You do not have permission to create pages. Please contact your administrator to grant the necessary permissions.',
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create page. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const onSubmit = (data: PageFormData) => {
    const input = {
      clientPortalId: data.clientPortalId,
      name: data.name,
      slug: data.path,
      description: data.description,
      status: data.status || 'active',
    };

    if (isEditing && page?._id) {
      editPage({ variables: { _id: page._id, input } });
    } else {
      addPage({ variables: { input } });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit Page' : 'New Page'}</Sheet.Title>
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
                      You need permission to create or edit pages. Please contact your administrator to grant the necessary permissions.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter name" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="path"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Path</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="/about-us" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea {...field} placeholder="Enter description" rows={4} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="status"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Status</Form.Label>
                  <Form.Control>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select status" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="active">active</Select.Item>
                        <Select.Item value="inactive">inactive</Select.Item>
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
              <Button type="submit" disabled={hasPermissionError || savingAdd || savingEdit}>
                {savingAdd || savingEdit
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Page'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
