import { Button, Form, Input, Sheet, toast } from 'erxes-ui';
import { CMS_TAGS_ADD, CMS_TAGS_EDIT } from './graphql/mutations';
import { useEffect, useState } from 'react';

import { IconAlertCircle } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  clientPortalId: string;
  colorCode?: string;
  createdAt: string;
  updatedAt?: string;
}

interface TagDrawerProps {
  tag?: Tag;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
}

interface TagFormData {
  name: string;
  slug: string;
  clientPortalId: string;
  colorCode: string;
}

export function TagDrawer({
  tag,
  isOpen,
  onClose,
  clientPortalId,
}: TagDrawerProps) {
  const isEditing = !!tag;
  const [hasPermissionError, setHasPermissionError] = useState(false);

  const form = useForm<TagFormData>({
    defaultValues: {
      name: '',
      slug: '',
      colorCode: '#3B82F6',
      clientPortalId,
    },
  });

  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name || '',
        slug: tag.slug || '',
        colorCode: tag.colorCode || '#3B82F6',
        clientPortalId: tag.clientPortalId || clientPortalId,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        colorCode: '#3B82F6',
        clientPortalId,
      });
    }
    setHasPermissionError(false);
  }, [tag, form, isOpen, clientPortalId]);

  const [addTag, { loading: saving }] = useMutation(CMS_TAGS_ADD, {
    refetchQueries: ['CmsTags'],
    onCompleted: () => {
      onClose();
      form.reset();
      toast({
        title: 'Success',
        description: 'Tag created successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Tag creation error:', error);

      const permissionError = error.graphQLErrors?.some(
        (e) =>
          e.message === 'Permission required' ||
          e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: 'Permission Required',
          description:
            'You do not have permission to create tags. Please contact your administrator to grant the necessary permissions.',
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: 'Error',
          description:
            error.message || 'Failed to create tag. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const [editTag, { loading: editing }] = useMutation(CMS_TAGS_EDIT, {
    refetchQueries: ['CmsTags'],
    onCompleted: () => {
      onClose();
      form.reset();
      toast({
        title: 'Success',
        description: 'Tag updated successfully',
        variant: 'default',
      });
    },
    onError: (error) => {
      console.error('Tag update error:', error);

      const permissionError = error.graphQLErrors?.some(
        (e) =>
          e.message === 'Permission required' ||
          e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: 'Permission Required',
          description:
            'You do not have permission to edit tags. Please contact your administrator to grant the necessary permissions.',
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: 'Error',
          description:
            error.message || 'Failed to update tag. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const onSubmit = (data: TagFormData) => {
    const input = {
      ...data,
    };

    if (isEditing && tag?._id) {
      editTag({
        variables: {
          _id: tag._id,
          input,
        },
      });
    } else {
      addTag({
        variables: {
          input,
        },
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    const slug = generateSlug(name);
    form.setValue('slug', slug);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit Tag' : 'New Tag'}</Sheet.Title>
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
                  <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">
                      Permission Required
                    </p>
                    <p className="text-red-700 mt-1">
                      You need permission to create or edit tags. Please contact
                      your administrator to grant the necessary permissions.
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
                  <Form.Label>Tag Name</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter tag name"
                      required
                      onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e.target.value);
                      }}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="slug"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="tag-slug" required />
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
                disabled={saving || editing || hasPermissionError}
              >
                {saving || editing
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : hasPermissionError
                  ? 'Permission Required'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Tag'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
