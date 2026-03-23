import { IconAlertCircle } from '@tabler/icons-react';
import { Form, ScrollArea, toast } from 'erxes-ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { ApolloError, useQuery } from '@apollo/client';
import { useAddPage } from './hooks/useAddPage';
import { useEditPage } from './hooks/useEditPage';
import { IPageDrawerProps, IPageFormData } from './types/pageTypes';
import { CONTENT_CMS_LIST } from '../graphql/queries';
import {
  useCmsTranslation,
  TranslationData,
} from '../shared/hooks/useCmsTranslation';
import { PageEditorColumn } from './components/PageEditorColumn';
import { PageSidebarPanel } from './components/PageSidebarPanel';
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

const blocksToHtml = (raw: string): string => {
  try {
    const blocks = JSON.parse(raw) as BlockContent[];
    if (!Array.isArray(blocks)) return raw;

    return blocks
      .map((block) => {
        const inlines = block.content ?? [];
        const html = inlines
          .map((inline) => {
            let text = inline.text ?? '';
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
  excerpt?: string;
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
  video?: { url: string; name: string; type?: string } | null;
  videoUrl?: string;
  audio?: { url: string; name: string; type?: string } | null;
  documents?: { url: string; name: string }[];
  attachments?: { url: string; name: string }[];
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
  currentExcerpt: string | undefined,
  isCreating: boolean,
  isNonDefaultLang: boolean,
): PageTranslationInput[] {
  const entries: PageTranslationInput[] = [];

  for (const [lang, tData] of Object.entries(translations)) {
    if (lang === defaultLanguage || lang === selectedLanguage) continue;
    if (tData.title || tData.content || tData.excerpt) {
      entries.push({
        language: lang,
        title: tData.title || '',
        content: normalizeContent(tData.content || ''),
        excerpt: tData.excerpt || '',
        type: 'page',
      });
    }
  }

  if (isCreating && isNonDefaultLang) {
    entries.push({
      language: selectedLanguage,
      title: currentName,
      content: normalizeContent(currentDescription || ''),
      excerpt: currentExcerpt || '',
      type: 'page',
    });
  }

  return entries;
}

interface PageFormProps extends IPageDrawerProps {
  onFormReady?: (formState: {
    form: any;
    onSubmit: (data?: any) => void;
    saving: boolean;
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

  // Fetch CMS config for languages
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

  const form = useForm<IPageFormData>({
    defaultValues: {
      name: '',
      path: '',
      description: '',
      excerpt: '',
      parentId: '',
      status: 'active',
      clientPortalId,
      thumbnail: null,
      gallery: [],
      video: null,
      videoUrl: '',
      audio: null,
      documents: [],
      attachments: [],
    },
  });

  const { editPage, loading: savingEdit } = useEditPage();
  const { addPage, loading: savingAdd } = useAddPage();
  const saving = savingEdit || savingAdd;

  useEffect(() => {
    if (isEditing && page) {
      const p = page as any;
      form.reset({
        name: page.name || '',
        path: page.slug || '',
        description: page.description || '',
        excerpt: p.excerpt || '',
        parentId: p.parentId || '',
        status: page.status || 'active',
        clientPortalId,
        thumbnail: p.thumbnail || null,
        gallery: (p.pageImages || []).map((i: any) => i.url).filter(Boolean),
        video: (p.video && p.video.url) || p.video || null,
        videoUrl: p.videoUrl || '',
        audio: (p.audio && p.audio.url) || p.audio || null,
        documents: (p.documents || []).map((d: any) => d.url).filter(Boolean),
        attachments: (p.attachments || []).map((a: any) => a.url).filter(Boolean),
      });
    } else {
      form.reset({
        name: '',
        path: '',
        description: '',
        excerpt: '',
        parentId: '',
        status: 'active',
        clientPortalId,
        thumbnail: null,
        gallery: [],
        video: null,
        videoUrl: '',
        audio: null,
        documents: [],
        attachments: [],
      });
    }
  }, [page, isEditing, clientPortalId, form]);

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

  // Keep refs so the stable onSubmit always reads the latest values
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

  const onSubmitRef = useRef<(data: IPageFormData) => void>(() => {});

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
    const currentExcerpt = data.excerpt;

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
    const attachmentsPayload = makeAttachmentArrayFromUrls(data.attachments ?? []);
    const videoPayload = normalizeAttachment(data.video ?? undefined);
    const audioPayload = normalizeAttachment(data.audio ?? undefined);

    const input: PageInput = {
      clientPortalId: data.clientPortalId,
      name: main.name,
      slug: data.path,
      description: main.description,
      parentId: data.parentId || undefined,
      status: data.status || 'active',
      thumbnail: normalizeAttachment(data.thumbnail ?? undefined) as any,
      pageImages: imagesPayload.length ? (imagesPayload as any) : undefined,
      video: videoPayload as any,
      videoUrl: data.videoUrl,
      audio: audioPayload as any,
      documents: documentsPayload.length ? (documentsPayload as any) : undefined,
      attachments: attachmentsPayload.length ? (attachmentsPayload as any) : undefined,
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
        currentExcerpt,
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

  // Stable wrapper — safe to capture in onFormReady
  const onSubmit = useCallback(
    (data: IPageFormData) => onSubmitRef.current(data),
    [],
  );

  /**
   * Language switch handler for pages.
   * Maps: name ↔ title, description ↔ content in translations.
   */
  const isSwitchingLanguageRef = useRef(false);

  const onLanguageChange = (lang: string) => {
    isSwitchingLanguageRef.current = true;
    handleLanguageChange(
      lang,
      () => ({
        title: form.getValues('name') || '',
        content: form.getValues('description') || '',
        excerpt: form.getValues('excerpt') || '',
      }),
      (data) => {
        form.setValue('name', data.title || '');
        form.setValue('description', data.content || '');
        form.setValue('excerpt', data.excerpt || '');
        // Allow editor onChange after the new editor has mounted
        requestAnimationFrame(() => {
          isSwitchingLanguageRef.current = false;
        });
      },
      page
        ? {
            title: page.name || '',
            content: page.description || '',
            excerpt: (page as any).excerpt || '',
          }
        : undefined,
    );
  };

  const handleEditorChange = useCallback(
    (content: string) => {
      if (isSwitchingLanguageRef.current) return;
      form.setValue('description', content);
    },
    [form],
  );

  const formInitializedRef = useRef(false);

  useEffect(() => {
    if (onFormReady && form && !formInitializedRef.current) {
      onFormReady({ form, onSubmit, saving });
      formInitializedRef.current = true;
    }
  }, [form, onSubmit, saving, onFormReady]);

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
            <PageEditorColumn
              form={form}
              selectedLanguage={selectedLanguage}
              defaultLanguage={defaultLanguage}
              page={page}
              handleEditorChange={handleEditorChange}
            />
            <PageSidebarPanel
              form={form}
              websiteId={clientPortalId}
              currentPageId={page?._id}
              availableLanguages={availableLanguages}
              defaultLanguage={defaultLanguage}
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
