import { useMutation, useQuery } from '@apollo/client';
import { IconAlertCircle } from '@tabler/icons-react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Button, Form, Input, Sheet, toast } from 'erxes-ui';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CONTENT_CMS_LIST } from '@/cms/graphql/queries';
import { LanguageSelector } from '@/cms/shared/LanguageSelector';
import {
  TranslationData,
  useCmsTranslation,
} from '@/cms/shared/hooks/useCmsTranslation';
import { cmsLanguageAtom } from '@/cms/shared/states/cmsLanguageState';
import { CMS_TAGS_ADD, CMS_TAGS_EDIT } from '@/cms/tags/graphql/mutations';
import { CMS_TAG_DETAIL } from '@/cms/tags/graphql/queries';
import { createSlug } from '@/cms/utils/createSlug';
import { CmsTag, TagFormData } from '@/cms/tags/types/tagTypes';

interface TagDrawerProps {
  tag?: CmsTag;
  isOpen: boolean;
  onClose: () => void;
  clientPortalId: string;
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

export function TagDrawer({
  tag,
  isOpen,
  onClose,
  clientPortalId,
}: TagDrawerProps) {
  const isEditing = !!tag?._id;
  const [hasPermissionError, setHasPermissionError] = useState(false);
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
    objectId: tag?._id,
    type: 'tag',
    availableLanguages,
    defaultLanguage,
    resetKey: `${clientPortalId}-${isOpen}`,
  });

  const { data: tagDetailData } = useQuery(CMS_TAG_DETAIL, {
    variables: {
      _id: tag?._id,
      clientPortalId,
    },
    fetchPolicy: 'network-only',
    skip: !isOpen || !tag?._id,
  });

  const baseTag: CmsTag | undefined = tagDetailData?.cmsTag || tag;

  const form = useForm<TagFormData>({
    defaultValues: getEmptyTagFormValues(clientPortalId),
  });

  useEffect(() => {
    if (!isOpen) return;

    form.reset(tagToFormValues(baseTag, clientPortalId));
    setHasPermissionError(false);
  }, [baseTag, form, isOpen, clientPortalId]);

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

    if (!form.getValues('name')) {
      applyTranslationToForm(cmsLanguage);
    }
    setSelectedLanguage(cmsLanguage);
  }, [
    isOpen,
    selectedLanguage,
    defaultLanguage,
    cmsLanguage,
    applyTranslationToForm,
    setSelectedLanguage,
    form,
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

    if (!form.getValues('name')) {
      applyTranslationToForm(selectedLanguage);
    }
  }, [
    isOpen,
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
    const isNonDefaultLang =
      Boolean(selectedLanguage) &&
      Boolean(defaultLanguage) &&
      selectedLanguage !== defaultLanguage;
    const currentTranslationData = getCurrentTranslationData();

    let mainName = data.name;

    if (!isEditing && isNonDefaultLang) {
      if (!defaultLangData?.title?.trim()) {
        toast({
          title: 'Validation Error',
          description:
            'Please fill in the default language name before creating a tag in another language.',
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
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Sheet.View className="sm:max-w-lg p-0 bg-background">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit Tag' : 'New Tag'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
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
                  <Form.Label>
                    Tag Name
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-blue-600">
                        ({selectedLanguage})
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter tag name"
                      required
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isTranslationMode) {
                          handleNameChange(e.target.value);
                        }
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
                  <Form.Label>
                    Slug
                    {isTranslationMode && (
                      <span className="ml-2 text-xs text-gray-500">
                        (shared across languages)
                      </span>
                    )}
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="tag-slug" required />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={onClose} variant="outline">
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
