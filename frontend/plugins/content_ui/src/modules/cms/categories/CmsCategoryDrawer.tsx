import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { Button, Form, Input, Select, Sheet, Textarea, toast } from 'erxes-ui';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  CMS_CATEGORIES,
  CMS_CATEGORIES_ADD,
  CMS_CATEGORIES_EDIT,
  CMS_CATEGORY_DETAIL,
  CMS_CUSTOM_FIELD_GROUPS,
} from './graphql';
import { CONTENT_CMS_LIST } from '../graphql/queries';
import {
  CategoryCustomFieldsSection,
  FieldGroup,
} from './components/CategoryCustomFieldsSection';
import { CustomFieldValue } from '../posts/CustomFieldInput';
import {
  createCategoryFormSchema,
  CategoryFormType,
} from '../constants/categoryFormSchema';
import { LanguageSelector } from '../shared/LanguageSelector';
import {
  TranslationData,
  useCmsTranslation,
} from '../shared/hooks/useCmsTranslation';
import { cmsLanguageAtom } from '../shared/states/cmsLanguageState';

interface ITreeOption {
  _id: string;
  label: string;
}

interface IFlatCategory {
  _id: string;
  name: string;
  parentId?: string;
}

const naturalSort = (a: string, b: string) =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function buildTreeOptions(flat: IFlatCategory[]): ITreeOption[] {
  const result: ITreeOption[] = [];
  const visited = new Set<string>();

  const addWithChildren = (item: IFlatCategory, depth: number) => {
    if (visited.has(item._id)) return;
    visited.add(item._id);
    const prefix = depth > 0 ? '-'.repeat(depth) + ' ' : '';
    result.push({ _id: item._id, label: prefix + item.name });
    flat
      .filter((c) => c.parentId === item._id)
      .sort((a, b) => naturalSort(a.name, b.name))
      .forEach((child) => addWithChildren(child, depth + 1));
  };

  flat
    .filter((c) => !c.parentId)
    .sort((a, b) => naturalSort(a.name, b.name))
    .forEach((root) => addWithChildren(root, 0));
  flat.forEach((c) => {
    if (!visited.has(c._id)) result.push({ _id: c._id, label: c.name });
  });

  return result;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  clientPortalId: string;
  createdAt: string;
  description?: string;
  parentId?: string;
  status?: string;
  customFieldsData?: { field: string; value?: CustomFieldValue }[];
  translations?: { language: string }[];
}

interface CmsCategoryDrawerProps {
  category?: Partial<Category>;
  isOpen: boolean;
  onClose: () => void | Promise<void>;
  clientPortalId: string;
  onRefetch?: () => void;
}

interface CmsCategoriesResponse {
  cmsCategories: {
    list: Category[];
  };
}

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  customFieldsData?: { field: string; value?: CustomFieldValue }[];
  [key: `customFields.${string}`]: CustomFieldValue | undefined; // Allow dynamic custom field properties
}

interface CmsConfig {
  clientPortalId: string;
  languages?: string[];
  language?: string;
}

interface CategoryTranslationInput {
  language: string;
  title: string;
  content?: string;
  type: string;
  customFieldsData?: unknown[];
}

interface CategoryInput extends CategoryFormData {
  clientPortalId: string;
  language?: string;
  translations?: CategoryTranslationInput[];
}

const EMPTY_FORM_VALUES: CategoryFormType = {
  name: '',
  slug: '',
  description: '',
  parentId: undefined,
  status: 'active',
  customFieldsData: [],
};

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-')
    .replaceAll(/^-+|-+$/g, '');

const collectDescendantIds = (
  allCategories: Category[],
  rootId?: string,
): Set<string> => {
  const descendants = new Set<string>();
  if (!rootId) return descendants;

  const queue: string[] = [rootId];
  while (queue.length) {
    const currentId = queue.shift() as string;
    const children = allCategories.filter((c) => c.parentId === currentId);
    for (const child of children) {
      if (!descendants.has(child._id)) {
        descendants.add(child._id);
        queue.push(child._id);
      }
    }
  }
  return descendants;
};

const categoryToFormValues = (
  category?: Partial<Category>,
): CategoryFormType => {
  if (!category) return EMPTY_FORM_VALUES;
  return {
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    parentId: category.parentId || undefined,
    status: category.status === 'inactive' ? 'inactive' : 'active',
    customFieldsData: category.customFieldsData || [],
  };
};

const hasTranslationValue = (data?: TranslationData): boolean => {
  if (!data) return false;
  if (data.title && data.title.trim() !== '') return true;
  if (data.content && data.content.trim() !== '') return true;
  return Boolean(data.customFieldsData && data.customFieldsData.length > 0);
};

const toCategoryCustomFields = (
  customFieldsData?: unknown[],
): CategoryFormType['customFieldsData'] => {
  return Array.isArray(customFieldsData)
    ? (customFieldsData as CategoryFormType['customFieldsData'])
    : [];
};

const buildCategoryTranslations = (
  translations: Record<string, TranslationData>,
  defaultLanguage: string,
  selectedLanguage: string,
  currentData: TranslationData,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): CategoryTranslationInput[] => {
  const entries: CategoryTranslationInput[] = [];

  for (const [lang, translation] of Object.entries(translations)) {
    if (lang === defaultLanguage || lang === selectedLanguage) continue;
    if (!hasTranslationValue(translation)) continue;

    entries.push({
      language: lang,
      title: translation.title || '',
      content: translation.content || '',
      customFieldsData: translation.customFieldsData || [],
      type: 'category',
    });
  }

  if (isCreating && isNonDefaultLang && hasTranslationValue(currentData)) {
    entries.push({
      language: selectedLanguage,
      title: currentData.title || '',
      content: currentData.content || '',
      customFieldsData: currentData.customFieldsData || [],
      type: 'category',
    });
  }

  return entries;
};

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
  const setCmsLanguage = useSetAtom(cmsLanguageAtom);
  const cmsLanguage = useAtomValue(cmsLanguageAtom);

  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !clientPortalId,
  });

  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: CmsConfig) => cms.clientPortalId === clientPortalId,
  );
  const availableLanguages: string[] = cmsConfig?.languages || [];
  const defaultLanguage: string = cmsConfig?.language || 'en';

  const {
    selectedLanguage,
    setSelectedLanguage,
    translations,
    defaultLangData,
    isTranslationMode,
    languageOptions,
    handleLanguageChange,
  } = useCmsTranslation({
    objectId: category?._id,
    type: 'category',
    availableLanguages,
    defaultLanguage,
    resetKey: `${clientPortalId}-${isOpen}`,
  });

  const { data: categoryDetailData } = useQuery(CMS_CATEGORY_DETAIL, {
    variables: {
      _id: category?._id,
      clientPortalId,
    },
    fetchPolicy: 'network-only',
    skip: !isOpen || !category?._id,
  });

  const baseCategory: Partial<Category> | undefined =
    categoryDetailData?.cmsCategory || category;

  // Fetch custom field groups first to create schema
  const { data: customFieldsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: {
      clientPortalId,
    },
    fetchPolicy: 'cache-first',
    skip: !isOpen,
  });

  const currentCategoryId = category?._id;

  const fieldGroups: FieldGroup[] = (
    customFieldsData?.cmsCustomFieldGroupList?.list || []
  ).filter((group: any) => {
    const ids: string[] = group.customPostTypeIds || [];
    // show if no restriction, or explicitly includes 'category'
    const showOnCategory = ids.length === 0 || ids.includes('category');
    if (!showOnCategory) return false;
    // if specific categories are set, only show for this category
    const enabledCategoryIds: string[] = group.enabledCategoryIds || [];
    if (enabledCategoryIds.length > 0 && currentCategoryId) {
      return enabledCategoryIds.includes(currentCategoryId);
    }
    return true;
  });

  // Create dynamic schema with custom field validations
  const schema = createCategoryFormSchema(
    fieldGroups.flatMap((group: FieldGroup) => group.fields || []),
  );

  const form = useForm<CategoryFormType>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_FORM_VALUES,
  });

  useEffect(() => {
    if (!isOpen) return;
    form.reset(categoryToFormValues(baseCategory));
    setIsSlugManuallyEdited(false);
  }, [baseCategory, isOpen, form]);

  // Watch for name changes and update slug accordingly
  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const isNameDirty = !!form.formState.dirtyFields.name;

  useEffect(() => {
    if (
      !isOpen ||
      !nameValue ||
      isSlugManuallyEdited ||
      !isNameDirty ||
      isTranslationMode
    ) {
      return;
    }
    const generatedSlug = generateSlug(nameValue);
    if (generatedSlug !== slugValue) {
      form.setValue('slug', generatedSlug);
    }
  }, [
    nameValue,
    isSlugManuallyEdited,
    isNameDirty,
    form,
    slugValue,
    isOpen,
    isTranslationMode,
  ]);

  // Fetch categories for Parent Category select
  const { data: catsData } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId,
      limit: 100,
      language: selectedLanguage || defaultLanguage,
    },
    fetchPolicy: 'cache-first',
    skip: !isOpen,
  });
  const allCategories: Category[] = catsData?.cmsCategories?.list || [];
  const descendantIds = collectDescendantIds(allCategories, category?._id);

  const rawParentOptions: Category[] = allCategories.filter(
    (c: Category) => c._id !== category?._id && !descendantIds.has(c._id),
  );

  const parentOptions = buildTreeOptions(rawParentOptions);

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
        shouldValidate: true,
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

  const getCurrentTranslationData = useCallback(
    (): TranslationData => ({
      title: form.getValues('name') || '',
      content: form.getValues('description') || '',
      customFieldsData: form.getValues('customFieldsData') || [],
    }),
    [form],
  );

  const setTranslationFormData = useCallback(
    (data: TranslationData) => {
      form.setValue('name', data.title || '');
      form.setValue('description', data.content || '');
      form.setValue(
        'customFieldsData',
        toCategoryCustomFields(data.customFieldsData),
      );
    },
    [form],
  );

  const getOriginalTranslationData = useCallback(
    (): TranslationData => ({
      title: baseCategory?.name || '',
      content: baseCategory?.description || '',
      customFieldsData: baseCategory?.customFieldsData || [],
    }),
    [baseCategory],
  );

  const applyTranslationToForm = useCallback(
    (lang: string) => {
      if (lang === defaultLanguage) {
        setTranslationFormData(defaultLangData || getOriginalTranslationData());
        return;
      }

      setTranslationFormData(translations[lang] || {});
    },
    [
      defaultLanguage,
      defaultLangData,
      getOriginalTranslationData,
      setTranslationFormData,
      translations,
    ],
  );

  useEffect(() => {
    if (
      !isOpen ||
      !selectedLanguage ||
      !defaultLanguage ||
      !cmsLanguage ||
      cmsLanguage === defaultLanguage ||
      selectedLanguage !== defaultLanguage
    ) {
      return;
    }

    applyTranslationToForm(cmsLanguage);
    setSelectedLanguage(cmsLanguage);
  }, [
    isOpen,
    selectedLanguage,
    defaultLanguage,
    cmsLanguage,
    applyTranslationToForm,
    setSelectedLanguage,
  ]);

  useEffect(() => {
    if (
      !isOpen ||
      !selectedLanguage ||
      !defaultLanguage ||
      selectedLanguage === defaultLanguage
    ) {
      return;
    }

    applyTranslationToForm(selectedLanguage);
  }, [
    isOpen,
    selectedLanguage,
    defaultLanguage,
    translations,
    baseCategory,
    applyTranslationToForm,
  ]);

  const onLanguageChange = useCallback(
    (lang: string) => {
      setCmsLanguage(lang);

      handleLanguageChange(
        lang,
        getCurrentTranslationData,
        setTranslationFormData,
        getOriginalTranslationData(),
      );

      if (lang === defaultLanguage) {
        setTranslationFormData(defaultLangData || getOriginalTranslationData());
      } else {
        setTranslationFormData(translations[lang] || {});
      }
    },
    [
      defaultLanguage,
      defaultLangData,
      getCurrentTranslationData,
      getOriginalTranslationData,
      handleLanguageChange,
      setCmsLanguage,
      setTranslationFormData,
      translations,
    ],
  );

  const [addCategory, { loading: adding }] = useMutation(CMS_CATEGORIES_ADD, {
    onCompleted: (data) => {
      // Update cache to automatically refresh all components using CMS_CATEGORIES query
      const existingCategories = client.readQuery<CmsCategoriesResponse>({
        query: CMS_CATEGORIES,
        variables: {
          clientPortalId,
          limit: 100,
          language: selectedLanguage || defaultLanguage,
        },
      });

      if (existingCategories && data?.cmsCategoriesAdd) {
        client.writeQuery({
          query: CMS_CATEGORIES,
          variables: {
            clientPortalId,
            limit: 100,
            language: selectedLanguage || defaultLanguage,
          },
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
        const existingCategories = client.readQuery<CmsCategoriesResponse>({
          query: CMS_CATEGORIES,
          variables: {
            clientPortalId,
            limit: 100,
            language: selectedLanguage || defaultLanguage,
          },
        });

        if (existingCategories && data?.cmsCategoriesEdit) {
          const updatedList = existingCategories.cmsCategories.list.map(
            (cat: Category) =>
              cat._id === data.cmsCategoriesEdit._id
                ? data.cmsCategoriesEdit
                : cat,
          );

          client.writeQuery({
            query: CMS_CATEGORIES,
            variables: {
              clientPortalId,
              limit: 100,
              language: selectedLanguage || defaultLanguage,
            },
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
    const isNonDefaultLang =
      Boolean(selectedLanguage) &&
      Boolean(defaultLanguage) &&
      selectedLanguage !== defaultLanguage;
    const currentTranslationData = getCurrentTranslationData();

    let mainFields: TranslationData = {
      title: data.name,
      content: data.description || '',
      customFieldsData: data.customFieldsData || [],
    };

    if (!isEditing && isNonDefaultLang) {
      if (!defaultLangData?.title) {
        toast({
          title: 'Validation Error',
          description:
            'Please fill in the default language fields before creating a category in another language.',
          variant: 'destructive',
        });
        return;
      }

      mainFields = defaultLangData;
    }

    const input: CategoryInput = {
      ...data,
      clientPortalId,
      name: mainFields.title || '',
      description: mainFields.content || '',
      customFieldsData: toCategoryCustomFields(mainFields.customFieldsData),
    };

    if (selectedLanguage) {
      input.language =
        !isEditing && isNonDefaultLang ? defaultLanguage : selectedLanguage;
    }

    if (defaultLanguage) {
      const translationEntries = buildCategoryTranslations(
        translations,
        defaultLanguage,
        selectedLanguage,
        currentTranslationData,
        !isEditing,
        isNonDefaultLang,
      );

      if (translationEntries.length > 0) {
        input.translations = translationEntries;
      }
    }

    if (isEditing && category?._id) {
      editCategory({ variables: { _id: category._id, input } });
    } else {
      addCategory({ variables: { input } });
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>
            {isEditing ? 'Edit Category' : 'New Category'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <Sheet.Content className="overflow-y-auto">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 space-y-4"
            >
              {availableLanguages.length > 0 && (
                <LanguageSelector
                  selectedLanguage={selectedLanguage}
                  languageOptions={languageOptions}
                  onLanguageChange={onLanguageChange}
                />
              )}

              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      Name
                      {isTranslationMode && (
                        <span className="ml-2 text-xs text-blue-600">
                          ({selectedLanguage})
                        </span>
                      )}
                    </Form.Label>
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
                    <Form.Label>
                      Slug
                      {isTranslationMode && (
                        <span className="ml-2 text-xs text-gray-500">
                          (shared across languages)
                        </span>
                      )}
                    </Form.Label>
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
                    <Form.Label>
                      Description
                      {isTranslationMode && (
                        <span className="ml-2 text-xs text-blue-600">
                          ({selectedLanguage})
                        </span>
                      )}
                    </Form.Label>
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
                    <Form.Label>
                      Parent Category
                      {isTranslationMode && (
                        <span className="ml-2 text-xs text-gray-500">
                          (shared across languages)
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger>
                          <Select.Value placeholder="Select..." />
                        </Select.Trigger>
                        <Select.Content>
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

              <Form.Field
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      Status
                      {isTranslationMode && (
                        <span className="ml-2 text-xs text-gray-500">
                          (shared across languages)
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
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

              {fieldGroups.length > 0 && (
                <CategoryCustomFieldsSection
                  fieldGroups={fieldGroups}
                  getCustomFieldValue={getCustomFieldValue}
                  updateCustomFieldValue={updateCustomFieldValue}
                  form={form}
                />
              )}

              <div className="flex justify-end space-x-2">
                <Button onClick={() => onClose()} variant="outline">
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
          </Sheet.Content>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
