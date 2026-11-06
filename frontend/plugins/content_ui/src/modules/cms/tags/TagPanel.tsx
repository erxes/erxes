import { useMutation, useQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Form, Input, toast } from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { CONTENT_CMS_LIST } from '@/cms/graphql/queries';
import {
  CMS_TRANSLATION_FIELDS,
  TranslationData,
  useCmsTranslation,
  useRecordInDefaultLanguage,
} from '@/cms/shared/hooks/useCmsTranslation';
import { cmsLanguageAtom } from '@/cms/shared/states/cmsLanguageState';
import {
  getCmsDefaultLanguage,
  getInitialCmsLanguage,
} from '@/cms/shared/utils';
import { CmsSavedRowLoadError } from '@/cms/shared/components/CmsSavedRowLoadError';
import {
  CONTENT_PANEL_INPUT_CLASS_NAME,
  ContentPanelFormField,
  ContentPanelLanguageRow,
} from '@/cms/shared/side-panel/ContentPanelForm';
import { ContentPanelRecordState } from '@/cms/shared/side-panel/ContentPanelLayout';
import { ContentPanelRemoveAction } from '@/cms/shared/side-panel/ContentPanelRemoveAction';
import {
  CMS_TAG_CONTENT_TYPE,
  IContentPanelViewProps,
  IContentPanelViews,
} from '@/cms/shared/side-panel/contentPanelTypes';
import {
  useContentPanel,
  useContentPanelDraft,
} from '@/cms/shared/side-panel/useContentPanel';
import { CMS_TAGS_ADD, CMS_TAGS_EDIT } from '@/cms/tags/graphql/mutations';
import { CMS_TAG_DETAIL } from '@/cms/tags/graphql/queries';
import { useRemoveTag } from '@/cms/tags/hooks/useRemoveTag';
import { createSlug } from '@/cms/utils/createSlug';
import { CmsTag, TagFormData } from '@/cms/tags/types/tagTypes';

interface TagPanelFormProps {
  tag?: CmsTag;
  clientPortalId: string;
  onCancel: () => void;
  onCreated?: (tagId: string) => void;
  onUpdated?: () => void;
}

interface CmsConfig {
  clientPortalId: string;
  languages?: string[];
  language?: string;
}

interface TagTranslationInput {
  language: string;
  title: string;
  type: string;
}

const DEFAULT_TAG_COLOR = '#3B82F6';

const getEmptyTagFormValues = (clientPortalId: string): TagFormData => ({
  name: '',
  slug: '',
  colorCode: DEFAULT_TAG_COLOR,
  clientPortalId,
});

const tagToFormValues = (
  tag: CmsTag | undefined,
  clientPortalId: string,
): TagFormData => {
  if (!tag) return getEmptyTagFormValues(clientPortalId);

  return {
    name: tag.name || '',
    slug: tag.slug || '',
    colorCode: tag.colorCode || DEFAULT_TAG_COLOR,
    clientPortalId: tag.clientPortalId || clientPortalId,
  };
};

const hasTranslationValue = (data?: TranslationData): boolean =>
  Boolean(data?.title?.trim());

const buildTagTranslations = (
  translations: Record<string, TranslationData>,
  defaultLanguage: string,
  selectedLanguage: string,
  currentData: TranslationData,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): TagTranslationInput[] => {
  const entries: TagTranslationInput[] = [];

  for (const [language, translation] of Object.entries(translations)) {
    if (language === defaultLanguage || language === selectedLanguage) {
      continue;
    }

    if (!hasTranslationValue(translation)) continue;

    entries.push({
      language,
      title: translation.title || '',
      type: 'tag',
    });
  }

  if (isCreating && isNonDefaultLang && hasTranslationValue(currentData)) {
    entries.push({
      language: selectedLanguage,
      title: currentData.title || '',
      type: 'tag',
    });
  }

  return entries;
};

const TagPanelForm = ({
  tag,
  clientPortalId,
  onCancel,
  onCreated,
  onUpdated,
}: TagPanelFormProps) => {
  const { t } = useTranslation('content');
  const isEditing = !!tag?._id;
  const [hasPermissionError, setHasPermissionError] = useState(false);
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
    objectId: tag?._id,
    type: 'tag',
    availableLanguages,
    defaultLanguage,
    cmsConfig,
    cmsQuery,
    resetKey: `${clientPortalId}-${tag?._id || 'new'}`,
  });

  const baseTag = useRecordInDefaultLanguage(
    tag,
    cmsConfig,
    translations,
    CMS_TRANSLATION_FIELDS.tag,
  );

  const form = useForm<TagFormData>({
    defaultValues: getEmptyTagFormValues(clientPortalId),
  });

  useEffect(() => {
    form.reset(tagToFormValues(baseTag, clientPortalId), {
      keepDirtyValues: baseTag !== tag,
    });
    setHasPermissionError(false);
  }, [baseTag, tag, form, clientPortalId]);

  const getCurrentTranslationData = useCallback(
    (): TranslationData => ({
      title: form.getValues('name') || '',
    }),
    [form],
  );

  const setTranslationFormData = useCallback(
    (data: TranslationData) => {
      form.setValue('name', data.title || '');
    },
    [form],
  );

  const getOriginalTranslationData = useCallback(
    (): TranslationData => ({
      title: baseTag?.name || '',
    }),
    [baseTag],
  );

  const applyTranslationToForm = useCallback(
    (language: string) => {
      if (language === defaultLanguage) {
        setTranslationFormData(defaultLangData || getOriginalTranslationData());
        return;
      }

      setTranslationFormData(translations[language] || {});
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

    if (!form.getValues('name')) {
      applyTranslationToForm(initialLanguage);
    }
    setSelectedLanguage(initialLanguage);
  }, [
    selectedLanguage,
    defaultLanguage,
    initialLanguage,
    applyTranslationToForm,
    setSelectedLanguage,
    form,
  ]);

  useEffect(() => {
    if (
      !selectedLanguage ||
      !defaultLanguage ||
      selectedLanguage === defaultLanguage
    ) {
      return;
    }

    if (!form.getValues('name')) {
      applyTranslationToForm(selectedLanguage);
    }
  }, [
    selectedLanguage,
    defaultLanguage,
    translations,
    baseTag,
    applyTranslationToForm,
    form,
  ]);

  const onLanguageChange = useCallback(
    (language: string) => {
      setCmsLanguage(language);

      handleLanguageChange(
        language,
        getCurrentTranslationData,
        setTranslationFormData,
        getOriginalTranslationData(),
      );
    },
    [
      getCurrentTranslationData,
      getOriginalTranslationData,
      handleLanguageChange,
      setCmsLanguage,
      setTranslationFormData,
    ],
  );

  const [addTag, { loading: saving }] = useMutation(CMS_TAGS_ADD, {
    refetchQueries: ['CmsTags'],
    onCompleted: (data) => {
      toast({
        title: t('success'),
        description: t('tag-created-successfully'),
        variant: 'default',
      });

      if (data?.cmsTagsAdd?._id) {
        onCreated?.(data.cmsTagsAdd._id);
      }
    },
    onError: (error) => {
      const permissionError = error.graphQLErrors?.some(
        (e) =>
          e.message === 'Permission required' ||
          e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: t('permission-required'),
          description: t('no-permission-to-create-tags'),
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: t('error'),
          description: error.message || t('failed-to-create-tag'),
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const [editTag, { loading: editing }] = useMutation(CMS_TAGS_EDIT, {
    refetchQueries: ['CmsTags'],
    onCompleted: () => {
      onUpdated?.();
      toast({
        title: t('success'),
        description: t('tag-updated-successfully'),
        variant: 'default',
      });
    },
    onError: (error) => {
      const permissionError = error.graphQLErrors?.some(
        (e) =>
          e.message === 'Permission required' ||
          e.extensions?.code === 'INTERNAL_SERVER_ERROR',
      );

      if (permissionError) {
        setHasPermissionError(true);
        toast({
          title: t('permission-required'),
          description: t('no-permission-to-edit-tags'),
          variant: 'destructive',
          duration: 8000,
        });
      } else {
        toast({
          title: t('error'),
          description: error.message || t('failed-to-update-tag'),
          variant: 'destructive',
          duration: 5000,
        });
      }
    },
  });

  const onSubmit = (data: TagFormData) => {
    if (hasPermissionError || savedRowLoad.isBlocked) return;

    const isNonDefaultLang =
      Boolean(selectedLanguage) &&
      Boolean(defaultLanguage) &&
      selectedLanguage !== defaultLanguage;
    const currentTranslationData = getCurrentTranslationData();

    let mainName = data.name;

    if (!isEditing && isNonDefaultLang) {
      if (!defaultLangData?.title?.trim()) {
        toast({
          title: t('validation-error'),
          description: t('tag-fill-default-lang-first'),
          variant: 'destructive',
        });
        return;
      }

      mainName = defaultLangData.title || '';
    }

    const input: TagFormData = {
      ...data,
      clientPortalId,
      name: mainName,
    };

    if (selectedLanguage) {
      input.language =
        !isEditing && isNonDefaultLang ? defaultLanguage : selectedLanguage;
    }

    if (defaultLanguage) {
      const translationEntries = buildTagTranslations(
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

  const handleNameChange = (name: string) => {
    const slug = createSlug(name);
    form.setValue('slug', slug);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-1 min-h-0 flex-col"
      >
        <PanelFormLayout
          onCancel={onCancel}
          saving={saving || editing}
          saveLabel={
            hasPermissionError
              ? t('permission-required')
              : isEditing
              ? t('save-changes')
              : t('create-tag')
          }
        >
          {savedRowLoad.hasFailed && (
            <CmsSavedRowLoadError onRetry={savedRowLoad.retry} />
          )}
          {availableLanguages.length > 0 && (
            <ContentPanelLanguageRow
              selectedLanguage={selectedLanguage}
              languageOptions={languageOptions}
              onLanguageChange={onLanguageChange}
            />
          )}

          {hasPermissionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">
                    {t('permission-required')}
                  </p>
                  <p className="text-red-700 mt-1">
                    {t('tag-permission-inline-desc')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <ContentPanelFormField
            control={form.control}
            name="name"
            required
            label={
              <>
                {t('tag-name')}
                {isTranslationMode && (
                  <span className="ml-2 text-xs text-blue-600">
                    ({selectedLanguage})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Input
                {...field}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
                autoFocus={!isEditing}
                placeholder={t('enter-tag-name')}
                required
                onChange={(e) => {
                  field.onChange(e);
                  if (!isTranslationMode) {
                    handleNameChange(e.target.value);
                  }
                }}
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
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({t('shared-across-languages')})
                  </span>
                )}
              </>
            }
            render={(field) => (
              <Input
                {...field}
                className={CONTENT_PANEL_INPUT_CLASS_NAME}
                placeholder="tag-slug"
                required
              />
            )}
          />
        </PanelFormLayout>
      </form>
    </Form>
  );
};

const TagPanelNew = () => {
  const { clientPortalId } = useContentPanelDraft(CMS_TAG_CONTENT_TYPE);
  const { openDetail, cancelDraft } = useContentPanel(CMS_TAG_CONTENT_TYPE);

  return (
    <TagPanelForm
      key={clientPortalId}
      clientPortalId={clientPortalId}
      onCancel={cancelDraft}
      onCreated={(tagId) => openDetail(tagId, { replace: true })}
    />
  );
};

const TagPanelDetail = ({ contentId }: IContentPanelViewProps) => {
  const { closePanel } = useContentPanel(CMS_TAG_CONTENT_TYPE);
  const { data, loading, error } = useQuery(CMS_TAG_DETAIL, {
    variables: { _id: contentId },
    fetchPolicy: 'network-only',
  });
  const tag: CmsTag | undefined = data?.cmsTag;

  return (
    <ContentPanelRecordState loading={loading} hasRecord={!!tag} error={error}>
      {tag && (
        <TagPanelForm
          key={tag._id}
          tag={tag}
          clientPortalId={tag.clientPortalId}
          onCancel={closePanel}
          onUpdated={closePanel}
        />
      )}
    </ContentPanelRecordState>
  );
};

const TagPanelActions = ({ contentId }: IContentPanelViewProps) => {
  const { t } = useTranslation('content');
  const { removeTag, loading } = useRemoveTag();

  return (
    <ContentPanelRemoveAction
      message={t('confirm-delete-this-tag')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeTag([contentId])
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('tag-deleted-successfully'),
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

const useTagPanelHeading = (contentId: string) => {
  const { data } = useQuery<{ cmsTag?: CmsTag }>(CMS_TAG_DETAIL, {
    variables: { _id: contentId },
  });

  return { name: data?.cmsTag?.name };
};

export const TAG_PANEL: IContentPanelViews = {
  addLabel: 'new-tag',
  editLabel: 'edit-tag',
  New: TagPanelNew,
  useHeading: useTagPanelHeading,
  Detail: TagPanelDetail,
  Actions: TagPanelActions,
};
