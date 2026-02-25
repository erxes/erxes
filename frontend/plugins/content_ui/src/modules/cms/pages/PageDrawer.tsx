import { IconAlertCircle } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAddPage } from './hooks/useAddPage';
import { useEditPage } from './hooks/useEditPage';
import { IPageDrawerProps, IPageFormData } from './types/pageTypes';

export function PageDrawer({
  page,
  isOpen,
  onClose,
  clientPortalId,
}: IPageDrawerProps) {
  const isEditing = !!page;
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const form = useForm<IPageFormData>({
    defaultValues: {
      name: '',
      path: '',
      description: '',
      status: 'active',
      clientPortalId,
    },
  });

  const { editPage, loading: savingEdit } = useEditPage();
  const { addPage, loading: savingAdd } = useAddPage();

  useEffect(() => {
    if (isEditing && page) {
      form.reset({
        name: page.name || '',
        path: page.slug || '',
        description: page.description || '',
        status: page.status || 'active',
        clientPortalId,
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
  }, [page, isEditing, clientPortalId]);

  const onCompleted = () => {
    onClose();
    form.reset();
    toast({
      title: 'Success',
      description: isEditing
        ? 'Page updated successfully.'
        : 'Page created successfully.',
      variant: 'default',
      duration: 3000,
    });
  };

  const onError = (error: any) => {
    const permissionError = error.graphQLErrors?.some(
      (e: any) =>
        e.message === 'Permission required' ||
        e.extensions?.code === 'INTERNAL_SERVER_ERROR',
    );

    if (permissionError) {
      setHasPermissionError(true);
      toast({
        title: 'Permission Required',
        description:
          'You do not have permission to perform this action. Please contact your administrator.',
        variant: 'destructive',
        duration: 8000,
      });
    } else {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save page. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const onSubmit = (data: IPageFormData) => {
    const input = {
      clientPortalId: data.clientPortalId,
      name: data.name,
      slug: data.path,
      description: data.description,
      status: data.status || 'active',
    };

    if (isEditing && page?._id) {
      editPage({ variables: { _id: page._id, input }, onCompleted, onError });
    } else {
      addPage({ variables: { input }, onCompleted, onError });
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
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-4"
          >
            {hasPermissionError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5 " />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">
                      Permission Required
                    </p>
                    <p className="text-red-700 mt-1">
                      You need permission to create or edit pages. Please
                      contact your administrator to grant the necessary
                      permissions.
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
                    <Textarea
                      {...field}
                      placeholder="Enter description"
                      rows={4}
                    />
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
              <Button
                type="submit"
                disabled={hasPermissionError || savingAdd || savingEdit}
              >
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
