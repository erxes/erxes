import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  CMS_CATEGORIES,
  CMS_CATEGORIES_ADD,
  CMS_CATEGORIES_EDIT,
} from './graphql';
import { ICategory, PostCategoryInput } from './types';

interface CmsCategoryDrawerProps {
  category?: Partial<ICategory>;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
  onRefetch?: () => void;
}

interface CategoryFormData {
  name: string;
  description?: string;
  slug?: string;
  status?: string;
  parentId?: string;
}

export function CmsCategoryDrawer({
  category,
  isOpen,
  onClose,
  clientPortalId,
  onRefetch,
}: CmsCategoryDrawerProps) {
  const isEditing = !!category?._id;
  const client = useApolloClient();

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      slug: '',
      status: 'active',
      parentId: undefined,
    },
  });

  useEffect(() => {
    if (category && isOpen) {
      form.reset({
        name: category.name || '',
        description: category.description || '',
        slug: category.slug || '',
        status: category.status || 'active',
        parentId: category.parentId || undefined,
      });
    } else if (isOpen) {
      form.reset({
        name: '',
        description: '',
        slug: '',
        status: 'active',
        parentId: undefined,
      });
    }
  }, [category, isOpen, form]);

  // Fetch categories for Parent Category select
  const { data: catsData } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId,
      limit: 100,
    },
    fetchPolicy: 'cache-first',
    skip: !isOpen,
  });
  const parentOptions: ICategory[] = (
    catsData?.cmsCategories?.list || []
  ).filter((c: ICategory) => c._id !== category?._id);

  const [addCategory, { loading: adding }] = useMutation(CMS_CATEGORIES_ADD, {
    onCompleted: (data) => {
      // Update cache to automatically refresh all components using CMS_CATEGORIES query
      const existingCategories = client.readQuery({
        query: CMS_CATEGORIES,
        variables: { clientPortalId, limit: 100 },
      });

      if (existingCategories && data?.cmsCategoriesAdd) {
        client.writeQuery({
          query: CMS_CATEGORIES,
          variables: { clientPortalId, limit: 100 },
          data: {
            ...existingCategories,
            cmsCategories: {
              ...existingCategories.cmsCategories,
              list: [
                ...existingCategories.cmsCategories.list,
                data.cmsCategoriesAdd,
              ],
            },
          },
        });
      }

      onRefetch?.();
      toast({ title: 'Success', description: 'Category created' });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [editCategory, { loading: editing }] = useMutation(
    CMS_CATEGORIES_EDIT,
    {
      onCompleted: (data) => {
        // Update cache to automatically refresh all components using CMS_CATEGORIES query
        const existingCategories = client.readQuery({
          query: CMS_CATEGORIES,
          variables: { clientPortalId, limit: 100 },
        });

        if (existingCategories && data?.cmsCategoriesEdit) {
          const updatedList = existingCategories.cmsCategories.list.map(
            (cat: any) =>
              cat._id === data.cmsCategoriesEdit._id
                ? data.cmsCategoriesEdit
                : cat,
          );

          client.writeQuery({
            query: CMS_CATEGORIES,
            variables: { clientPortalId, limit: 100 },
            data: {
              ...existingCategories,
              cmsCategories: {
                ...existingCategories.cmsCategories,
                list: updatedList,
              },
            },
          });
        }

        onRefetch?.();
        toast({ title: 'Success', description: 'Category updated' });
        onClose();
        form.reset();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  const onSubmit = (data: CategoryFormData) => {
    const input = { ...data, clientPortalId } as PostCategoryInput;
    if (isEditing && category?._id) {
      editCategory({ variables: { _id: category._id, input } });
    } else {
      addCategory({ variables: { input } });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>
            {isEditing ? 'Edit Category' : 'New Category'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-4"
          >
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter category name"
                      required
                    />
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
                      rows={3}
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
                    <Input {...field} placeholder="Enter category slug" />
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
                  <Form.Label>Parent Category</Form.Label>
                  <Form.Control>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select..." />
                      </Select.Trigger>
                      <Select.Content>
                        {parentOptions.map((opt) => (
                          <Select.Item key={opt._id} value={opt._id}>
                            {opt.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select status" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="active">Active</Select.Item>
                        <Select.Item value="inactive">Inactive</Select.Item>
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
              <Button type="submit" disabled={adding || editing}>
                {adding || editing
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Category'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
