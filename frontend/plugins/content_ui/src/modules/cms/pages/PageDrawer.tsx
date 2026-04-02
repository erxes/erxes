import { IconAlertCircle } from '@tabler/icons-react';
import { Form, ScrollArea, toast } from 'erxes-ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { ApolloError, useQuery } from '@apollo/client';
import { useSetAtom, useAtomValue } from 'jotai';
import { CustomFieldValue } from '../posts/CustomFieldInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pageFormSchema } from '../constants/pageFormSchema';
import { useEditPage } from './hooks/useEditPage';
import { useAddPage } from './hooks/useAddPage';
import { IPage, IPageDrawerProps, IPageFormData } from './types/pageTypes';
import { CONTENT_CMS_LIST, CMS_CUSTOM_FIELD_GROUPS } from '../graphql/queries';
import {
  useCmsTranslation,
  TranslationData,
} from '../shared/hooks/useCmsTranslation';
import { cmsLanguageAtom } from '../shared/states/cmsLanguageState';
import { PageEditorColumn } from './components/PageEditorColumn';
import { PageSidebarPanel } from './components/PageSidebarPanel';
import {
  PageCustomFieldsSection,
  FieldGroup,
} from './components/PageCustomFieldsSection';
import {
  normalizeAttachment,
  makeAttachmentArrayFromUrls,
} from '../posts/formHelpers';

interface InlineContent {
  text?: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
  };
}

interface BlockContent {
  type?: string;
  content?: InlineContent[];
  props?: {
    level?: number;
  };
}

const escapeHtml = (str: string): string =>
  str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const blocksToHtml = (raw: string): string => {
  try {
    const blocks = JSON.parse(raw) as BlockContent[];
    if (!Array.isArray(blocks)) return raw;

    return blocks
      .map((block) => {
        const inlines = block.content ?? [];
        const html = inlines
          .map((inline) => {
            let text = escapeHtml(inline.text ?? '');
            if (inline.styles?.bold) text = `<strong>${text}</strong>`;
            if (inline.styles?.italic) text = `<em>${text}</em>`;
            if (inline.styles?.underline) text = `<u>${text}</u>`;
            if (inline.styles?.strike) text = `<s>${text}</s>`;
            if (inline.styles?.code) text = `<code>${text}</code>`;
            return text;
          })
          .join('');

        if (block.type === 'heading') {
          const level = block.props?.level ?? 1;
          return `<h${level}>${html}</h${level}>`;
        }
        if (block.type === 'codeBlock') {
          return `<pre><code>${html}</code></pre>`;
        }
        return `<p>${html}</p>`;
      })
      .join('');
  } catch {
    return raw;
  }
};

const normalizeContent = (raw: string): string => {
  return raw.trimStart().startsWith('[') ? blocksToHtml(raw) : raw;
};

interface CmsConfig {
  clientPortalId: string;
  languages?: string[];
  language?: string;
}

interface GraphQLErrorEntry {
  message: string;
  extensions?: { code?: string };
}

interface PageTranslationInput {
  language: string;
  title: string;
  content: string;
  type: string;
}

interface PageInput {
  clientPortalId: string;
  name: string;
  slug: string;
  description: string | undefined;
  parentId?: string;
  status: string;
  language?: string;
  translations?: PageTranslationInput[];
  thumbnail?: { url: string; name: string; type?: string } | null;
  pageImages?: { url: string; name: string }[];
  videoUrl?: string;
  documents?: { url: string; name: string }[];
  attachments?: { url: string; name: string }[];
  customFieldsData?: { field: string; value: CustomFieldValue }[];
}

function resolveMainFields(
  currentName: string,
  currentDescription: string | undefined,
  isCreating: boolean,
  isNonDefaultLang: boolean,
  defaultLangData: TranslationData | null,
): { name: string; description: string | undefined } | null {
  if (isCreating && isNonDefaultLang) {
    if (!defaultLangData) {
      return null;
    }
    return {
      name: defaultLangData.title || '',
      description: normalizeContent(defaultLangData.content || ''),
    };
  }
  return {
    name: currentName,
    description: normalizeContent(currentDescription || ''),
  };
}

function resolveLanguage(
  selectedLanguage: string,
  defaultLanguage: string,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): string {
  return isCreating && isNonDefaultLang ? defaultLanguage : selectedLanguage;
}

function buildPageTranslations(
  translations: Record<string, TranslationData>,
  defaultLanguage: string,
  selectedLanguage: string,
  currentName: string,
  currentDescription: string | undefined,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): PageTranslationInput[] {
  const entries: PageTranslationInput[] = [];

  for (const [lang, tData] of Object.entries(translations)) {
    if (lang === defaultLanguage || lang === selectedLanguage) continue;
    if (tData.title || tData.content) {
      entries.push({
        language: lang,
        title: tData.title || '',
        content: normalizeContent(tData.content || ''),
        type: 'page',
      });
    }
  }

  if (isCreating && isNonDefaultLang) {
    entries.push({
      language: selectedLanguage,
      title: currentName,
      content: normalizeContent(currentDescription || ''),
      type: 'page',
    });
  }

  return entries;
}

interface PageFormProps extends IPageDrawerProps {
  onFormReady?: (formState: {
    form: UseFormReturn<IPageFormData>;
    onSubmit: (data: IPageFormData) => void;
    getSaving: () => boolean;
    handleLanguageChange: (lang: string) => void;
  }) => void;
}

export function PageDrawer({
  page,
  onClose,
  clientPortalId,
  onFormReady,
}: PageFormProps) {
  const isEditing = Boolean(page);
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
    isTranslationMode,
    languageOptions,
    handleLanguageChange,
    defaultLangData,
    translations,
  } = useCmsTranslation({
    objectId: page?._id,
    type: 'page',
    availableLanguages,
    defaultLanguage,
    resetKey: clientPortalId,
  });

  // Create dynamic validation schema with custom fields
  const createValidationSchema = useCallback((fieldGroups: any[]) => {
    const baseSchema = pageFormSchema;

    // If no custom fields, return base schema
    if (!fieldGroups.length) return baseSchema;

    // Create individual field validations for required custom fields
    const customFieldShape: Record<string, z.ZodTypeAny> = {};

    for (const group of fieldGroups) {
      for (const field of group.fields || []) {
        if (field.isRequired) {
          customFieldShape[field._id] = z.custom<CustomFieldValue>(
            (value) => {
              if (!value) return false;
              if (typeof value === 'string' && value.trim() === '')
                return false;
              if (Array.isArray(value) && value.length === 0) return false;
              return true;
            },
            { message: `${field.label} is required` },
          );
        }
      }
    }

    // Create a schema that validates the entire customFieldsData array
    const customFieldsValidation = z
      .array(
        z.object({
          field: z.string(),
          value: z.custom<CustomFieldValue>(),
        }),
      )
      .superRefine((data, ctx) => {
        // Check each required field has a valid value
        for (const group of fieldGroups) {
          for (const field of group.fields || []) {
            if (field.isRequired) {
              const fieldValue = data.find(
                (item) => item.field === field._id,
              )?.value;

              if (!fieldValue) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} is required`,
                  path: ['customFieldsData'],
                });
              } else if (
                typeof fieldValue === 'string' &&
                fieldValue.trim() === ''
              ) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} cannot be empty`,
                  path: ['customFieldsData'],
                });
              } else if (Array.isArray(fieldValue) && fieldValue.length === 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `${field.label} requires at least one selection`,
                  path: ['customFieldsData'],
                });
              }
            }
          }
        }
      });

    return baseSchema.extend({
      customFieldsData: customFieldsValidation.optional(),
    });
  }, []);

  const { data: customFieldsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: {
      clientPortalId,
    },
    skip: !clientPortalId,
  });

  const fieldGroups: FieldGroup[] = (
    customFieldsData?.cmsCustomFieldGroupList?.list || []
  ).filter(
    (group: FieldGroup) =>
      !group.customPostTypeIds || group.customPostTypeIds.length === 0,
  );

  const form = useForm<IPageFormData>({
    defaultValues: {
      name: '',
      path: '',
      description: '',
      parentId: '',
      status: 'active',
      clientPortalId,
      thumbnail: null,
      gallery: [],
      videoUrl: '',
      documents: [],
      attachments: [],
      customFieldsData: [],
    },
    resolver: zodResolver(createValidationSchema(fieldGroups)),
  });

  const { editPage, loading: savingEdit } = useEditPage();
  const { addPage, loading: savingAdd } = useAddPage();
  const saving = savingEdit || savingAdd;

  const savingRef = useRef(saving);
  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    if (isEditing && page) {
      form.reset({
        name: page.name || '',
        path: page.slug || '',
        description: page.description || '',
        parentId: page.parentId || '',
        status: page.status || 'active',
        clientPortalId,
        thumbnail: page.thumbnail || null,
        gallery: (page.pageImages || []).map((i) => i.url).filter(Boolean),
        videoUrl: page.videoUrl || '',
        documents: (page.documents || []).map((d) => d.url).filter(Boolean),
        attachments: (page.attachments || []).map((a) => a.url).filter(Boolean),
        customFieldsData: page.customFieldsData || [],
      });
    } else {
      form.reset({
        name: '',
        path: '',
        description: '',
        parentId: '',
        status: 'active',
        clientPortalId,
        thumbnail: null,
        gallery: [],
        videoUrl: '',
        documents: [],
        attachments: [],
        customFieldsData: [],
      });
    }
  }, [page, isEditing, clientPortalId, form]);

  // Helper: apply translation (or clear) translatable fields
  const applyTranslationToForm = useCallback(
    (lang: string) => {
      const translation = translations[lang];
      form.setValue('name', translation?.title || '');
      form.setValue('description', translation?.content || '');
    },
    [translations, form],
  );

  // Initial language sync from cmsLanguageAtom.
  // This must run AFTER the form-reset effect above so form.setValue
  // overwrites the default-lang data, and it must call form.setValue
  // BEFORE setSelectedLanguage so the Editor (which remounts on key
  // change) reads the correct initialContent.
  useEffect(() => {
    if (
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
    selectedLanguage,
    defaultLanguage,
    cmsLanguage,
    applyTranslationToForm,
    setSelectedLanguage,
  ]);

  // When page data loads, the form-reset effect above overwrites translatable
  // fields with default-lang data.  Re-apply for the current non-default lang.
  const appliedForPageRef = useRef<IPage | null>(null);
  useEffect(() => {
    if (
      !selectedLanguage ||
      !defaultLanguage ||
      selectedLanguage === defaultLanguage
    ) {
      return;
    }
    if (isEditing && !page) return;
    if (appliedForPageRef.current === (page ?? null)) return;

    applyTranslationToForm(selectedLanguage);
    appliedForPageRef.current = page ?? null;
  }, [
    selectedLanguage,
    defaultLanguage,
    applyTranslationToForm,
    isEditing,
    page,
  ]);

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

  const onError = (error: ApolloError) => {
    const permissionError = error.graphQLErrors?.some(
      (e: GraphQLErrorEntry) =>
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

  const selectedLanguageRef = useRef(selectedLanguage);
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  const defaultLanguageRef = useRef(defaultLanguage);
  useEffect(() => {
    defaultLanguageRef.current = defaultLanguage;
  }, [defaultLanguage]);

  const defaultLangDataRef = useRef(defaultLangData);
  useEffect(() => {
    defaultLangDataRef.current = defaultLangData;
  }, [defaultLangData]);

  const translationsRef = useRef(translations);
  useEffect(() => {
    translationsRef.current = translations;
  }, [translations]);

  const handleLanguageChangeRef = useRef(handleLanguageChange);
  useEffect(() => {
    handleLanguageChangeRef.current = handleLanguageChange;
  }, [handleLanguageChange]);

  const pageRef = useRef(page);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  const onSubmitRef = useRef<(data: IPageFormData) => void>(() => undefined);

  onSubmitRef.current = (data: IPageFormData) => {
    const curSelectedLanguage = selectedLanguageRef.current;
    const curDefaultLanguage = defaultLanguageRef.current;
    const curDefaultLangData = defaultLangDataRef.current;
    const curTranslations = translationsRef.current;

    const isNonDefaultLang =
      Boolean(curSelectedLanguage) &&
      Boolean(curDefaultLanguage) &&
      curSelectedLanguage !== curDefaultLanguage;
    const isCreating = !isEditing;
    const currentName = data.name;
    const currentDescription = data.description;

    const main = resolveMainFields(
      currentName,
      currentDescription,
      isCreating,
      isNonDefaultLang,
      curDefaultLangData,
    );

    if (!main) {
      toast({
        title: 'Validation Error',
        description:
          'Please fill in the default language fields before creating a page in another language.',
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }

    const imagesPayload = makeAttachmentArrayFromUrls(data.gallery ?? []);
    const documentsPayload = makeAttachmentArrayFromUrls(data.documents ?? []);
    const attachmentsPayload = makeAttachmentArrayFromUrls(
      data.attachments ?? [],
    );
    const input: PageInput = {
      clientPortalId: data.clientPortalId,
      name: main.name,
      slug: data.path,
      description: main.description,
      parentId: data.parentId || undefined,
      status: data.status || 'active',
      thumbnail: normalizeAttachment(data.thumbnail ?? undefined),
      pageImages: imagesPayload.length ? imagesPayload : undefined,
      videoUrl: data.videoUrl,
      documents: documentsPayload.length ? documentsPayload : undefined,
      attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
      customFieldsData: data.customFieldsData || [],
    };

    if (curSelectedLanguage) {
      input.language = resolveLanguage(
        curSelectedLanguage,
        curDefaultLanguage,
        isCreating,
        isNonDefaultLang,
      );
    }

    if (curDefaultLanguage) {
      const translationEntries = buildPageTranslations(
        curTranslations,
        curDefaultLanguage,
        curSelectedLanguage,
        currentName,
        currentDescription,
        isCreating,
        isNonDefaultLang,
      );

      if (translationEntries.length > 0) {
        input.translations = translationEntries;
      }
    }

    if (isEditing && page?._id) {
      editPage({ variables: { _id: page._id, input }, onCompleted, onError });
    } else {
      addPage({ variables: { input }, onCompleted, onError });
    }
  };

  const onSubmit = useCallback(
    (data: IPageFormData) => onSubmitRef.current(data),
    [],
  );

  const isSwitchingLanguageRef = useRef(false);

  const onLanguageChange = useCallback(
    (lang: string) => {
      isSwitchingLanguageRef.current = true;
      setCmsLanguage(lang);

      const curPage = pageRef.current;
      const curDefaultLanguage = defaultLanguageRef.current;
      const curDefaultLangData = defaultLangDataRef.current;
      const curTranslations = translationsRef.current;

      handleLanguageChangeRef.current(
        lang,
        () => ({
          title: form.getValues('name') || '',
          content: form.getValues('description') || '',
        }),
        (data) => {
          form.setValue('name', data.title || '');
          form.setValue('description', data.content || '');
        },
        curPage
          ? {
              title: curPage.name || '',
              content: curPage.description || '',
            }
          : undefined,
      );

      // Explicitly set form values after handleLanguageChange to guarantee
      // the Editor (which remounts on selectedLanguage key change) reads
      // the correct initialContent.
      if (lang === curDefaultLanguage) {
        form.setValue('name', curDefaultLangData?.title || curPage?.name || '');
        form.setValue(
          'description',
          curDefaultLangData?.content || curPage?.description || '',
        );
      } else {
        const translation = curTranslations[lang];
        form.setValue('name', translation?.title || '');
        form.setValue('description', translation?.content || '');
      }

      requestAnimationFrame(() => {
        isSwitchingLanguageRef.current = false;
      });
    },
    [form, setCmsLanguage],
  );

  const handleEditorChange = useCallback(
    (content: string) => {
      if (isSwitchingLanguageRef.current) return;
      form.setValue('description', content);
    },
    [form],
  );

  const formInitializedRef = useRef(false);

  const getSaving = useCallback(() => savingRef.current, []);

  useEffect(() => {
    if (onFormReady && form && !formInitializedRef.current) {
      onFormReady({
        form,
        onSubmit,
        getSaving,
        handleLanguageChange: onLanguageChange,
      });
      formInitializedRef.current = true;
    }
  }, [form, onSubmit, getSaving, onFormReady]);

  return (
    <ScrollArea className="flex-auto" viewportClassName="p-4">
      <Form {...form}>
        <div className="flex flex-col w-full mb-4 px-4 pt-4">
          {hasPermissionError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <IconAlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">
                    Permission Required
                  </p>
                  <p className="text-red-700 mt-1">
                    You need permission to create or edit pages. Please contact
                    your administrator to grant this permission.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PageEditorColumn
                form={form}
                selectedLanguage={selectedLanguage}
                defaultLanguage={defaultLanguage}
                page={page}
                handleEditorChange={handleEditorChange}
              />
              {fieldGroups.length > 0 && (
                <PageCustomFieldsSection
                  fieldGroups={fieldGroups}
                  form={form}
                />
              )}
            </div>
            <PageSidebarPanel
              form={form}
              websiteId={clientPortalId}
              currentPageId={page?._id}
              availableLanguages={availableLanguages}
              selectedLanguage={selectedLanguage}
              languageOptions={languageOptions}
              handleLanguageChange={onLanguageChange}
              isTranslationMode={isTranslationMode}
            />
          </div>
        </div>
      </Form>
    </ScrollArea>
  );
}
