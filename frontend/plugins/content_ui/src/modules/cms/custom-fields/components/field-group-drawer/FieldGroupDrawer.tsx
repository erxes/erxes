import { Button, Sheet, Input, MultipleSelector, Select } from 'erxes-ui';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ICustomFieldGroup } from '../../types/customFieldTypes';

const PAGES_FOR_RULES = gql`
  query PagesForRules($clientPortalId: String!) {
    cmsPageList(clientPortalId: $clientPortalId, limit: 100) {
      pages {
        _id
        name
      }
    }
  }
`;

const CATEGORIES_FOR_RULES = gql`
  query CategoriesForRules($clientPortalId: String!) {
    cmsCategories(clientPortalId: $clientPortalId, limit: 100) {
      list {
        _id
        name
      }
    }
  }
`;

const POSTS_FOR_RULES = gql`
  query PostsForRules($clientPortalId: String!) {
    cmsPostList(clientPortalId: $clientPortalId, limit: 100) {
      posts {
        _id
        title
      }
    }
  }
`;

interface FieldGroupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingGroup: ICustomFieldGroup | null;
  customTypes: any[];
  websiteId: string;
}

type ShowOnOption = { label: string; value: string };

const BUILT_IN_SHOW_ON: ShowOnOption[] = [
  { label: 'Pages', value: 'page' },
  { label: 'Categories', value: 'category' },
  { label: 'Posts', value: 'post' },
];

export function FieldGroupDrawer({
  isOpen,
  onClose,
  onSubmit,
  editingGroup,
  customTypes,
  websiteId,
}: FieldGroupDrawerProps) {
  const groupForm = useForm({
    defaultValues: {
      label: '',
      code: '',
      customPostTypeIds: [] as string[],
      enabledPageId: '' as string,
      enabledCategoryIds: [] as string[],
      enabledPostIds: [] as string[],
    },
  });

  const { data: pagesData } = useQuery(PAGES_FOR_RULES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId || !isOpen,
    fetchPolicy: 'cache-first',
  });

  const { data: categoriesData } = useQuery(CATEGORIES_FOR_RULES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId || !isOpen,
    fetchPolicy: 'cache-first',
  });

  const { data: postsData } = useQuery(POSTS_FOR_RULES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId || !isOpen,
    fetchPolicy: 'cache-first',
  });

  const pages: ShowOnOption[] = (pagesData?.cmsPageList?.pages || []).map(
    (p: any) => ({ label: p.name, value: p._id }),
  );

  const categories: ShowOnOption[] = (
    categoriesData?.cmsCategories?.list || []
  ).map((c: any) => ({ label: c.name, value: c._id }));

  const posts: ShowOnOption[] = (postsData?.cmsPostList?.posts || []).map(
    (p: any) => ({ label: p.title || p._id, value: p._id }),
  );

  const customTypeOptions: ShowOnOption[] = customTypes.map((t: any) => ({
    label: `${t.label} (${t.code})`,
    value: t._id,
  }));

  const allShowOnOptions: ShowOnOption[] = [
    ...BUILT_IN_SHOW_ON,
    ...customTypeOptions,
  ];

  useEffect(() => {
    if (editingGroup) {
      const enabledPageIds = editingGroup.enabledPageIds || [];
      groupForm.reset({
        label: editingGroup.label,
        code: editingGroup.code || '',
        customPostTypeIds: editingGroup.customPostTypeIds || [],
        enabledPageId: enabledPageIds[0] || '',
        enabledCategoryIds: editingGroup.enabledCategoryIds || [],
        enabledPostIds: editingGroup.enabledPostIds || [],
      });
    } else {
      groupForm.reset({
        label: '',
        code: '',
        customPostTypeIds: [],
        enabledPageId: '',
        enabledCategoryIds: [],
        enabledPostIds: [],
      });
    }
  }, [editingGroup, groupForm, isOpen]);

  const watchedPostTypeIds = groupForm.watch('customPostTypeIds');
  const showsOnPages = watchedPostTypeIds.includes('page');
  const showsOnCategories = watchedPostTypeIds.includes('category');
  const showsOnPosts = watchedPostTypeIds.includes('post');

  const handleSubmit = (data: any) => {
    // Convert single page select back to array for the parent
    onSubmit({
      ...data,
      enabledPageIds: data.enabledPageId ? [data.enabledPageId] : [],
    });
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header>
          <Sheet.Title>
            {editingGroup ? 'Edit Field Group' : 'Add Field Group'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <form
            onSubmit={groupForm.handleSubmit(handleSubmit)}
            className="space-y-4 p-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Label *</label>
              <Input
                {...groupForm.register('label', {
                  required: 'Label is required',
                })}
                placeholder="Enter label"
              />
              {groupForm.formState.errors.label && (
                <p className="text-sm text-red-500 mt-1">
                  {groupForm.formState.errors.label.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <Input
                {...groupForm.register('code')}
                placeholder="Enter code (e.g., product_info)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for programmatic access
              </p>
            </div>

            {/* Show On */}
            <div className="space-y-3 pt-2 border-t">
              <label className="block text-sm font-medium">Show on</label>
              <p className="text-xs text-muted-foreground -mt-2">
                Leave empty to show on all content. Select specific surfaces to
                restrict where this group appears.
              </p>

              <Controller
                name="customPostTypeIds"
                control={groupForm.control}
                render={({ field }) => {
                  const selected = allShowOnOptions.filter((o) =>
                    (field.value || []).includes(o.value),
                  );
                  return (
                    <MultipleSelector
                      value={selected as any}
                      options={allShowOnOptions as any}
                      placeholder="Pages, Categories, Posts, Post types…"
                      emptyIndicator="No options"
                      onChange={(selected: any[]) =>
                        field.onChange(selected.map((s) => s.value))
                      }
                    />
                  );
                }}
              />

              {/* Single page selector */}
              {showsOnPages && (
                <div className="pl-3 border-l-2 border-muted space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Specific page (leave empty = all pages)
                  </label>
                  <Controller
                    name="enabledPageId"
                    control={groupForm.control}
                    render={({ field }) => (
                      <Select
                        value={field.value || ''}
                        onValueChange={(val) =>
                          field.onChange(val === '__all__' ? '' : val)
                        }
                      >
                        <Select.Trigger className="w-full">
                          <Select.Value placeholder="All pages" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="__all__">All pages</Select.Item>
                          {pages.map((p) => (
                            <Select.Item key={p.value} value={p.value}>
                              {p.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    )}
                  />
                </div>
              )}

              {/* Specific categories sub-selector */}
              {showsOnCategories && (
                <div className="pl-3 border-l-2 border-muted space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Specific categories (leave empty = all categories)
                  </label>
                  <Controller
                    name="enabledCategoryIds"
                    control={groupForm.control}
                    render={({ field }) => {
                      const selected = categories.filter((c) =>
                        (field.value || []).includes(c.value),
                      );
                      return (
                        <MultipleSelector
                          value={selected as any}
                          options={categories as any}
                          placeholder="All categories"
                          emptyIndicator="No categories found"
                          onChange={(selected: any[]) =>
                            field.onChange(selected.map((s) => s.value))
                          }
                        />
                      );
                    }}
                  />
                </div>
              )}

              {/* Specific posts sub-selector */}
              {showsOnPosts && (
                <div className="pl-3 border-l-2 border-muted space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Specific posts (leave empty = all posts)
                  </label>
                  <Controller
                    name="enabledPostIds"
                    control={groupForm.control}
                    render={({ field }) => {
                      const selected = posts.filter((p) =>
                        (field.value || []).includes(p.value),
                      );
                      return (
                        <MultipleSelector
                          value={selected as any}
                          options={posts as any}
                          placeholder="All posts"
                          emptyIndicator="No posts found"
                          onChange={(selected: any[]) =>
                            field.onChange(selected.map((s) => s.value))
                          }
                        />
                      );
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {editingGroup ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
