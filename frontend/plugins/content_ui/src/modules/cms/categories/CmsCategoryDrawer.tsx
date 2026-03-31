import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import {
  CMS_CATEGORIES,
  CMS_CATEGORIES_ADD,
  CMS_CATEGORIES_EDIT,
  CMS_CUSTOM_FIELD_GROUPS,
} from './graphql';
import {
  CategoryCustomFieldsSection,
  FieldGroup,
} from './components/CategoryCustomFieldsSection';
import { CustomFieldValue } from '../posts/CustomFieldInput';

interface Category {
  _id: string;
  name: string;
  slug: string;
  clientPortalId: string;
  createdAt: string;
  description?: string;
  parentId?: string;
  status?: 'active' | 'inactive';
}

interface CmsCategoryDrawerProps {
  category?: Partial<Category>;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
  onRefetch?: () => void;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  customFieldsData?: { field: string; value: any }[];
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
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Function to convert name to slug format
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: undefined,
      status: 'active',
      customFieldsData: [],
    },
  });

  useEffect(() => {
    if (category && isOpen) {
      form.reset({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        parentId: category.parentId || undefined,
        status: (category.status as any) || 'active',
        customFieldsData: (category as any).customFieldsData || [],
      });
      setIsSlugManuallyEdited(false);
    } else if (isOpen) {
      form.reset({
        name: '',
        slug: '',
        description: '',
        parentId: undefined,
        status: 'active',
        customFieldsData: [],
      });
      setIsSlugManuallyEdited(false);
    }
  }, [category, isOpen, form]);

  // Watch for name changes and update slug accordingly
  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');

  useEffect(() => {
    if (nameValue && !isSlugManuallyEdited && isOpen) {
      const generatedSlug = generateSlug(nameValue);
      if (generatedSlug !== slugValue) {
        form.setValue('slug', generatedSlug);
      }
    }
  }, [nameValue, isSlugManuallyEdited, form, slugValue, isOpen]);

  // Fetch categories for Parent Category select
  const { data: catsData } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId,
      limit: 100,
    },
    fetchPolicy: 'cache-first',
    skip: !isOpen,
  });
  const parentOptions: Category[] = (
    catsData?.cmsCategories?.list || []
  ).filter((c: Category) => c._id !== category?._id);

  // Custom fields functionality
  const updateCustomFieldValue = useCallback(
    (fieldId: string, value: CustomFieldValue) => {
      const currentData = form.getValues('customFieldsData') || [];
      const existingIndex = currentData.findIndex(
        (item) => item.field === fieldId,
      );

      let updated;
      if (existingIndex >= 0) {
        updated = [...currentData];
        updated[existingIndex] = { field: fieldId, value };
      } else {
        updated = [...currentData, { field: fieldId, value }];
      }

      form.setValue('customFieldsData', updated, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    },
    [form],
  );

  const getCustomFieldValue = useCallback(
    (fieldId: string): CustomFieldValue => {
      const currentData = form.watch('customFieldsData') || [];
      const item = currentData.find((item) => item.field === fieldId);
      return item?.value ?? '';
    },
    [form],
  );

  // Fetch custom field groups
  const { data: customFieldsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: {
      clientPortalId,
    },
    fetchPolicy: 'cache-first',
    skip: !isOpen,
  });

  const fieldGroups = (
    customFieldsData?.cmsCustomFieldGroupList?.list || []
  ).filter(
    (group: any) =>
      !group.customPostTypeIds || group.customPostTypeIds.length === 0,
  );

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
    const input = { ...data, clientPortalId } as CategoryFormData;
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
              name="slug"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Slug</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="category-slug"
                      required
                      onChange={(e) => {
                        field.onChange(e);
                        setIsSlugManuallyEdited(true);
                      }}
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
                        <Select.Item value="active">active</Select.Item>
                        <Select.Item value="inactive">inactive</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            {fieldGroups.length > 0 && (
              <CategoryCustomFieldsSection
                fieldGroups={fieldGroups}
                getCustomFieldValue={getCustomFieldValue}
                updateCustomFieldValue={updateCustomFieldValue}
              />
            )}

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
