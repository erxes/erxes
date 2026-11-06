import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Form, Input, Select, Textarea, toast } from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import { createSlug } from '../utils/createSlug';
import {
  CategoryCustomFieldsSection,
  FieldGroup,
} from './components/CategoryCustomFieldsSection';
import { CustomFieldValue } from '../posts/CustomFieldInput';
import {
  createCategoryFormSchema,
  CategoryFormType,
} from '../constants/categoryFormSchema';
import {
  CMS_TRANSLATION_FIELDS,
  TranslationData,
  useCmsTranslation,
  useRecordInDefaultLanguage,
} from '../shared/hooks/useCmsTranslation';
import { cmsLanguageAtom } from '../shared/states/cmsLanguageState';
import {
  getCmsDefaultLanguage,
  getCmsSubmitLanguage,
  getInitialCmsLanguage,
} from '../shared/utils';
import { CmsSavedRowLoadError } from '../shared/components/CmsSavedRowLoadError';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import {
  CONTENT_PANEL_INPUT_CLASS_NAME,
  ContentPanelFormBlock,
  ContentPanelFormField,
  ContentPanelLanguageRow,
} from '@/cms/shared/side-panel/ContentPanelForm';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CMS_CATEGORY_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import {
  useContentPanel,
  useContentPanelDraft,
} from '@/cms/shared/side-panel/useContentPanel';
import { useRemoveCategories } from './hooks/useRemoveCategories';

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
  customFieldsData?: { field: string; value: CustomFieldValue }[];
  translations?: { language: string }[];
}

interface CategoryPanelFormProps {
  category?: Partial<Category>;
  clientPortalId: string;
  onCancel: () => void;
  onCreated?: (categoryId: string) => void;
  onUpdated?: () => void;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  status: 'active' | 'inactive';
  customFieldsData?: { field: string; value: CustomFieldValue }[];
  [key: `customFields.${string}`]: CustomFieldValue;
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

const CategoryPanelForm = ({
  category,
  clientPortalId,
  onCancel,
  onCreated,
  onUpdated,
}: CategoryPanelFormProps) => {
  const { t } = useTranslation('content');
  const isEditing = !!category?._id;
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const setCmsLanguage = useSetAtom(cmsLanguageAtom);
  const cmsLanguage = useAtomValue(cmsLanguageAtom);

  const cmsQuery = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
    skip: !clientPortalId,
  });

  const cmsConfig = cmsQuery.data?.contentCMSList?.find(
    (cms: CmsConfig) => cms.clientPortalId === clientPortalId,
  );
  const availableLanguages: string[] = cmsConfig?.languages || [];
  const defaultLanguage: string = getCmsDefaultLanguage(cmsConfig);

  const {
    selectedLanguage,
    setSelectedLanguage,
    translations,
    defaultLangData,
    savedRowLoad,
    isTranslationMode,
    languageOptions,
    handleLanguageChange,
  } = useCmsTranslation({
    objectId: category?._id,
    type: 'category',
    availableLanguages,
    defaultLanguage,
    cmsConfig,
    cmsQuery,
    resetKey: `${clientPortalId}-${category?._id || 'new'}`,
  });

  const baseCategory = useRecordInDefaultLanguage(
    category,
    cmsConfig,
    translations,
    CMS_TRANSLATION_FIELDS.category,
  );

  // Fetch custom field groups first to create schema
  const { data: customFieldsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: {
      clientPortalId,
    },
    fetchPolicy: 'cache-first',
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
    form.reset(categoryToFormValues(baseCategory), {
      keepDirtyValues: baseCategory !== category,
    });
    setIsSlugManuallyEdited(false);
  }, [baseCategory, category, form]);

  // Watch for name changes and update slug accordingly
  const nameValue = form.watch('name');
  const slugValue = form.watch('slug');
  const isNameDirty = !!form.formState.dirtyFields.name;

  useEffect(() => {
    if (
      !nameValue ||
      isSlugManuallyEdited ||
      !isNameDirty ||
      isTranslationMode
    ) {
      return;
    }
    const generatedSlug = createSlug(nameValue);
    if (generatedSlug !== slugValue) {
      form.setValue('slug', generatedSlug);
    }
  }, [
    nameValue,
    isSlugManuallyEdited,
    isNameDirty,
    form,
    slugValue,
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

  const initialLanguage = getInitialCmsLanguage(
    cmsLanguage,
    availableLanguages,
    defaultLanguage,
  );

  useEffect(() => {
    if (
      !selectedLanguage ||
      !defaultLanguage ||
      initialLanguage === defaultLanguage ||
      selectedLanguage !== defaultLanguage
    ) {
      return;
    }

    applyTranslationToForm(initialLanguage);
    setSelectedLanguage(initialLanguage);
  }, [
    selectedLanguage,
    defaultLanguage,
    initialLanguage,
    applyTranslationToForm,
    setSelectedLanguage,
  ]);

  useEffect(() => {
    if (
      !selectedLanguage ||
      !defaultLanguage ||
      selectedLanguage === defaultLanguage
    ) {
      return;
    }

    applyTranslationToForm(selectedLanguage);
  }, [
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
    refetchQueries: ['CmsCategories'],
    onCompleted: (data) => {
      toast({ title: t('success'), description: t('category-created') });

      if (data?.cmsCategoriesAdd?._id) {
        onCreated?.(data.cmsCategoriesAdd._id);
      }
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const [editCategory, { loading: editing }] = useMutation(
    CMS_CATEGORIES_EDIT,
    {
      refetchQueries: ['CmsCategories'],
      onCompleted: () => {
        toast({ title: t('success'), description: t('category-updated') });
        onUpdated?.();
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  const onSubmit = (data: CategoryFormData) => {
    if (savedRowLoad.isBlocked) return;

    const isNonDefaultLang =
      Boolean(selectedLanguage) &&
      Boolean(defaultLanguage) &&
      selectedLanguage !== defaultLanguage;
    const isNewTranslation = !isEditing && isNonDefaultLang;
    const currentTranslationData = getCurrentTranslationData();

    let mainFields: TranslationData = {
      title: data.name,
      content: data.description || '',
      customFieldsData: data.customFieldsData || [],
    };

    if (isNewTranslation) {
      if (!defaultLangData?.title) {
        toast({
          title: t('validation-error'),
          description: t('category-fill-default-lang-first'),
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

    const language = getCmsSubmitLanguage(
      selectedLanguage,
      defaultLanguage,
      isNewTranslation,
    );

    if (language) {
      input.language = language;
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={adding || editing}
          saveLabel={isEditing ? t('save-changes') : t('create-category')}
        >
          {savedRowLoad.hasFailed && (
            <CmsSavedRowLoadError onRetry={savedRowLoad.retry} />
          )}
          <ContentPanelLanguageRow
            selectedLanguage={selectedLanguage}
            languageOptions={languageOptions}
            onLanguageChange={onLanguageChange}
          />

          <ContentPanelFormField
            control={form.control}
            name="name"
            required
            label={
              <>
                {t('name')}
                {isTranslationMode && (
                  <span className="ml-1 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Input
                {...field}
                placeholder={t('enter-category-name')}
                required
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="slug"
            required
            label={
              <>
                {t('slug')}
                {isTranslationMode && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({t('shared-across-languages')})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Input
                {...field}
                placeholder="category-slug"
                required
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
                onChange={(e) => {
                  field.onChange(e);
                  setIsSlugManuallyEdited(true);
                }}
              />
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="parentId"
            label={
              <>
                {t('parent-category')}
                {isTranslationMode && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({t('shared-across-languages')})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value placeholder={t('select')} />
                </Select.Trigger>
                <Select.Content>
                  {parentOptions.map((opt) => (
                    <Select.Item
                      key={opt._id}
                      value={opt._id}
                      className="h-7 text-xs"
                    >
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="status"
            label={
              <>
                {t('status')}
                {isTranslationMode && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({t('shared-across-languages')})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger className={CONTENT_PANEL_INPUT_CLASS_NAME}>
                  <Select.Value placeholder={t('select-status')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="active" className="h-7 text-xs">
                    {t('active')}
                  </Select.Item>
                  <Select.Item value="inactive" className="h-7 text-xs">
                    {t('inactive')}
                  </Select.Item>
                </Select.Content>
              </Select>
            )}
          />

          <ContentPanelFormField
            control={form.control}
            name="description"
            block
            label={
              <>
                {t('description')}
                {isTranslationMode && (
                  <span className="ml-1 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Textarea
                {...field}
                placeholder={t('enter-description')}
                rows={3}
                className="text-xs"
              />
            )}
          />

          {fieldGroups.length > 0 && (
            <ContentPanelFormBlock label={t('custom-fields')}>
              <CategoryCustomFieldsSection
                fieldGroups={fieldGroups}
                websiteId={clientPortalId}
                getCustomFieldValue={getCustomFieldValue}
                updateCustomFieldValue={updateCustomFieldValue}
                form={form}
              />
            </ContentPanelFormBlock>
          )}
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const CategoryPanelNew = () => {
  const { clientPortalId } = useContentPanelDraft(CMS_CATEGORY_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useContentPanel(
    CMS_CATEGORY_CONTENT_TYPE,
  );

  return (
    <CategoryPanelForm
      key={clientPortalId}
      clientPortalId={clientPortalId}
      onCancel={cancelDraft}
      onCreated={(categoryId) => openDetail(categoryId, { replace: true })}
    />
  );
};

const CategoryPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { closePanel } = useContentPanel(CMS_CATEGORY_CONTENT_TYPE);
  const { data, loading, error } = useQuery(CMS_CATEGORY_DETAIL, {
    variables: { _id: contentId },
    fetchPolicy: 'network-only',
  });
  const category: Category | undefined = data?.cmsCategory;

  return (
    <ContentPanelRecordState
      loading={loading}
      hasRecord={!!category}
      error={error}
    >
      {category && (
        <CategoryPanelForm
          key={category._id}
          category={category}
          clientPortalId={category.clientPortalId}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </ContentPanelRecordState>
  );
};

const useCategoryPanelHeading = (contentId: string) => {
  const { data } = useQuery(CMS_CATEGORY_DETAIL, {
    variables: { _id: contentId },
    skip: !contentId,
  });
  const category: Category | undefined = data?.cmsCategory;

  return { name: category?.name };
};

const CategoryPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const client = useApolloClient();
  const { data } = useQuery(CMS_CATEGORY_DETAIL, {
    variables: { _id: contentId },
    fetchPolicy: 'cache-first',
  });
  const { removeSingleCategory, loading } = useRemoveCategories(
    data?.cmsCategory?.clientPortalId || '',
    () => client.refetchQueries({ include: ['CmsCategories'] }),
  );

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-this-category')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeSingleCategory(contentId)
          .then(() => {
            toast({
              title: t('success'),
              description: t('category-deleted-successfully'),
            });
            onCompleted();
          })
          .catch((error: Error) => {
            toast({
              title: t('error'),
              description: error.message,
              variant: 'destructive',
            });
          })
      }
    />
  );
};

export const CATEGORY_PANEL: IContentPanelViews = {
  addLabel: 'new-category',
  editLabel: 'edit-category',
  New: CategoryPanelNew,
  useHeading: useCategoryPanelHeading,
  Detail: CategoryPanelDetail,
  Actions: CategoryPanelActions,
};
