import { Button, Sheet, Input, MultipleSelector } from 'erxes-ui';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { useTranslation } from 'react-i18next';
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

const normalizeOptionText = (text: string) => text.toLowerCase().trim();

const getSearchableCommandProps = (options: ShowOnOption[]) => ({
  filter: (value: string, search: string) => {
    const option = options.find((item) => item.value === value);
    const text = normalizeOptionText(`${option?.label || ''} ${value}`);

    return text.includes(normalizeOptionText(search)) ? 1 : -1;
  },
});

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
  const { t } = useTranslation('content');
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
            {editingGroup ? t('edit-field-group') : t('add-field-group')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="overflow-y-auto">
          <form
            onSubmit={groupForm.handleSubmit(handleSubmit)}
            className="space-y-4 p-6"
          >
            <div>
              <label className="block text-sm font-medium mb-2">{t('label')} *</label>
              <Input
                {...groupForm.register('label', {
                  required: 'Label is required',
                })}
                placeholder={t('enter-label')}
              />
              {groupForm.formState.errors.label && (
                <p className="text-sm text-red-500 mt-1">
                  {groupForm.formState.errors.label.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('code')}</label>
              <Input
                {...groupForm.register('code')}
                placeholder={t('enter-code-group-eg')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('unique-identifier-for-programmatic-access')}
              </p>
            </div>

            {/* Show On */}
            <div className="space-y-3 pt-2 border-t">
              <label className="block text-sm font-medium">{t('show-on')}</label>
              <p className="text-xs text-muted-foreground -mt-2">
                {t('show-on-desc')}
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
                      placeholder={t('show-on-placeholder')}
                      emptyIndicator={t('no-options')}
                      commandProps={getSearchableCommandProps(
                        allShowOnOptions,
                      )}
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
                    {t('specific-page-desc')}
                  </label>
                  <Controller
                    name="enabledPageId"
                    control={groupForm.control}
                    render={({ field }) => {
                      const selected = pages.filter(
                        (p) => p.value === field.value,
                      );

                      return (
                        <MultipleSelector
                          value={selected as any}
                          options={pages as any}
                          placeholder={t('all-pages')}
                          emptyIndicator={t('no-pages-found')}
                          hidePlaceholderWhenSelected
                          commandProps={getSearchableCommandProps(pages)}
                          onChange={(selected: any[]) =>
                            field.onChange(
                              selected[selected.length - 1]?.value || '',
                            )
                          }
                        />
                      );
                    }}
                  />
                </div>
              )}

              {/* Specific categories sub-selector */}
              {showsOnCategories && (
                <div className="pl-3 border-l-2 border-muted space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    {t('specific-categories-desc')}
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
                          placeholder={t('all-categories')}
                          emptyIndicator={t('no-categories-found')}
                          commandProps={getSearchableCommandProps(categories)}
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
                    {t('specific-posts-desc')}
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
                          placeholder={t('all-posts')}
                          emptyIndicator={t('no-posts-found')}
                          commandProps={getSearchableCommandProps(posts)}
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
                {t('cancel')}
              </Button>
              <Button type="submit">
                {editingGroup ? t('update') : t('create')}
              </Button>
            </div>
          </form>
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
}
