import { BlockNoteEditor } from '@blocknote/core';
import { BLOCK_SCHEMA, parseBlocks, TABLE_SCHEMA, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePostMutations } from '../../../../hooks/usePostMutations';
import {
  makeAttachmentArrayFromUrls,
  normalizeAttachment,
} from '../../../formHelpers';
import { createSlug } from '../../../../utils/createSlug';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRef, useEffect, useCallback } from 'react';
import { getAutoArchiveDate } from './getAutoArchiveDate';
import { embedBlockStructureInHTML } from '../../../utils/blockStructureHTML';

interface CustomField {
  field: string;
  value: unknown;
}

interface PostFormData {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  type?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  categoryIds?: string[];
  tagIds?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  thumbnail?: string | null;
  gallery?: string[];
  video?: string | null;
  videoUrl?: string;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  publishDate?: Date | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: CustomField[];
}

interface TranslationEntry {
  title?: string;
  content?: string;
  excerpt?: string;
  customFieldsData?: CustomField[];
}

interface TranslationInput extends TranslationEntry {
  language: string;
  type: string;
}

interface DefaultLangData {
  title: string;
  content: string;
  excerpt: string;
  customFieldsData: CustomField[];
}

interface UsePostSubmissionProps {
  websiteId: string;
  editingPost?: { _id?: string };
  selectedLanguage?: string;
  defaultLanguage?: string;
  defaultLangData?: DefaultLangData | null;
  translations?: Record<string, TranslationEntry>;
  onClose?: () => void;
  /**
   * Called after a successful save, before any navigation, with the form
   * snapshot that was saved (e.g. to clear the form's dirty state).
   * `navigating` is true when the save will redirect/close right after —
   * silent autosaves stay on the page.
   */
  onSaved?: (savedData: unknown, meta: { navigating: boolean }) => void;
}

interface SubmitOptions {
  /** Save without toast or navigation — used by autosave. */
  silent?: boolean;
}

interface MainFields {
  title: string;
  content: string;
  excerpt: string | null | undefined;
  customFields: CustomField[] | undefined;
}

const blocksToHtml = async (raw: string): Promise<string> => {
  const parsedBlocks = parseBlocks(raw);
  if (!parsedBlocks) {
    return raw;
  }

  const blocks = parsedBlocks as (typeof BLOCK_SCHEMA.Block)[];
  const serializer = BlockNoteEditor.create({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
  });
  const html = await serializer.blocksToHTMLLossy(blocks);

  return embedBlockStructureInHTML(html, blocks);
};

/**
 * Extracts plain text from HTML for derived fields (for example, fallback title).
 *
 * Uses a DOM parser instead of regex-only stripping to avoid malformed HTML edge
 * cases where crafted input can bypass simplistic replacements.
 */
const extractText = (html: string): string => {
  if (!html) {
    return '';
  }

  if (typeof DOMParser !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return (doc.body.textContent ?? '').trim();
  }

  return html.replace(/<[^>]*>/g, '').trim();
};

const computeTitle = (data: PostFormData, contentHtml: string): string => {
  return (
    data.title?.trim() ||
    data.seoTitle?.trim() ||
    extractText(contentHtml).split('\n')[0].slice(0, 80) ||
    'Untitled'
  );
};

const redirectToPosts = (
  websiteId: string,
  searchParams: URLSearchParams,
  navigate: (url: string) => void,
) => {
  const typeCode = searchParams.get('type');
  const typeParam = typeCode && typeCode !== 'post' ? `?type=${typeCode}` : '';
  navigate(`/content/cms/${websiteId}/posts${typeParam}`);
};

const normalizeContent = async (raw: string): Promise<string> => {
  return raw.trimStart().startsWith('[') ? blocksToHtml(raw) : raw;
};

const filterCustomFields = (
  fields: CustomField[] | undefined,
): CustomField[] | undefined => {
  const filtered = fields?.filter(
    (item) =>
      item.value !== '' && item.value !== null && item.value !== undefined,
  );
  return filtered && filtered.length > 0 ? filtered : undefined;
};

const resolveMainFields = async (
  data: PostFormData,
  computedTitle: string,
  contentHtml: string,
  isCreating: boolean,
  isNonDefaultLang: boolean,
  curDefaultLangData: DefaultLangData | null | undefined,
): Promise<MainFields> => {
  if (isCreating && isNonDefaultLang && curDefaultLangData) {
    return {
      title: curDefaultLangData.title?.trim() || computedTitle || 'Untitled',
      content: await normalizeContent(curDefaultLangData.content ?? ''),
      excerpt: curDefaultLangData.excerpt?.trim() || null,
      customFields: filterCustomFields(curDefaultLangData.customFieldsData),
    };
  }

  return {
    title: computedTitle,
    content: contentHtml,
    excerpt: data.description?.trim() === '' ? null : data.description?.trim(),
    customFields: filterCustomFields(data.customFieldsData),
  };
};

const buildPostInput = (
  data: PostFormData,
  main: MainFields,
  websiteId: string,
  editingPostId: string | undefined,
): Record<string, unknown> => {
  const imagesPayload = makeAttachmentArrayFromUrls(data.gallery ?? []);
  const documentsPayload = makeAttachmentArrayFromUrls(data.documents ?? []);
  const attachmentsPayload = makeAttachmentArrayFromUrls(
    data.attachments ?? [],
  );
  const videoPayload = normalizeAttachment(data.video ?? undefined);
  const audioPayload = normalizeAttachment(data.audio ?? undefined);
  const pdfPayload = normalizeAttachment(data.pdf ?? undefined);
  const isEditing = Boolean(editingPostId);
  const generatedSlug = isEditing ? '' : createSlug(main.title);
  const shouldSetImages = isEditing || imagesPayload.length > 0;
  const slug = data.slug?.trim() || generatedSlug;

  return {
    clientPortalId: websiteId,
    title: main.title,
    ...(slug ? { slug } : {}),
    content: main.content,
    type: data.type,
    status: data.status ?? 'draft',
    categoryIds: data.categoryIds,
    tagIds: data.tagIds,
    featured: data.featured,
    publishedDate: data.publishDate ?? undefined,
    scheduledDate: data.scheduledDate ?? undefined,
    autoArchiveDate: getAutoArchiveDate(
      data.enableAutoArchive,
      data.autoArchiveDate,
    ),
    excerpt: main.excerpt,
    // Empty strings (not undefined) so clearing a value persists through $set
    seoTitle: data.seoTitle?.trim() ?? '',
    seoDescription: data.seoDescription?.trim() ?? '',
    thumbnail: normalizeAttachment(data.thumbnail ?? undefined),
    images: shouldSetImages ? imagesPayload : undefined,
    video: videoPayload,
    videoUrl: data.videoUrl,
    audio: audioPayload,
    documents: documentsPayload.length ? documentsPayload : undefined,
    attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
    pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
    customFieldsData: main.customFields,
  };
};

const buildTranslations = async (
  curTranslations: Record<string, TranslationEntry>,
  curDefaultLanguage: string,
  isNonDefaultLang: boolean,
  currentLanguage: string | undefined,
  computedTitle: string,
  contentHtml: string,
  data: PostFormData,
): Promise<TranslationInput[]> => {
  const entries: TranslationInput[] = [];

  for (const [lang, tData] of Object.entries(curTranslations)) {
    if (lang === curDefaultLanguage || lang === currentLanguage) continue;
    const hasData =
      tData.title ||
      tData.content ||
      tData.excerpt ||
      (tData.customFieldsData && tData.customFieldsData.length > 0);
    if (!hasData) continue;

    entries.push({
      language: lang,
      title: tData.title || '',
      content: await normalizeContent(tData.content || ''),
      excerpt: tData.excerpt || '',
      customFieldsData: tData.customFieldsData,
      type: 'post',
    });
  }

  if (isNonDefaultLang && currentLanguage) {
    entries.push({
      language: currentLanguage,
      title: computedTitle,
      content: contentHtml,
      excerpt: data.description?.trim() === '' ? '' : data.description?.trim(),
      customFieldsData: filterCustomFields(data.customFieldsData),
      type: 'post',
    });
  }

  return entries;
};

export const usePostSubmission = ({
  websiteId,
  editingPost,
  selectedLanguage,
  defaultLanguage,
  defaultLangData,
  translations,
  onClose,
  onSaved,
}: UsePostSubmissionProps) => {
  const { t } = useTranslation('content');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { createPost, editPost, creating, saving } = usePostMutations({
    websiteId,
  });

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

  /**
   * Persists the built input (create or edit), re-baselines the form via
   * onSaved, then — unless silent — toasts and navigates back to the list.
   */
  const savePost = async (
    input: Record<string, unknown>,
    formData: PostFormData,
    { silent }: SubmitOptions = {},
  ) => {
    try {
      if (editingPost?._id) {
        await editPost(editingPost._id, input);
      } else {
        await createPost(input);
      }

      onSaved?.(formData, { navigating: !silent });

      if (silent) {
        return;
      }

      toast({
        title: t('saved'),
        description: editingPost?._id
          ? t('post-saved-successfully')
          : t('post-created-successfully'),
      });

      if (onClose) {
        onClose();
        return;
      }

      redirectToPosts(websiteId, searchParams, navigate);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t('failed-to-save-post');

      toast({
        title: t('error'),
        description: message,
        variant: 'destructive',
      });
    }
  };

  /**
   * onSubmitRef holds the latest submit implementation. The returned onSubmit
   * is a stable useCallback wrapper — safe to capture once in onFormReady.
   */
  // No-op placeholder — immediately replaced below on every render
  const onSubmitRef = useRef<
    (data: PostFormData, options?: SubmitOptions) => Promise<void>
  >(
    async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
  );

  onSubmitRef.current = async (data: PostFormData, options?: SubmitOptions) => {
    if (!data.type) {
      if (options?.silent) {
        return;
      }

      toast({
        title: t('validation-error'),
        description: t('please-select-a-post-type'),
        variant: 'destructive',
      });
      return;
    }

    const contentHtml = await normalizeContent(data.content ?? '');
    const computedTitle = computeTitle(data, contentHtml);

    const currentLanguage = selectedLanguageRef.current;
    const curDefaultLanguage = defaultLanguageRef.current;
    const isCreating = !editingPost?._id;
    const isNonDefaultLang =
      Boolean(currentLanguage) &&
      Boolean(curDefaultLanguage) &&
      currentLanguage !== curDefaultLanguage;

    const main = await resolveMainFields(
      data,
      computedTitle,
      contentHtml,
      isCreating,
      isNonDefaultLang,
      defaultLangDataRef.current,
    );

    const input = buildPostInput(data, main, websiteId, editingPost?._id);

    if (currentLanguage) {
      input.language = currentLanguage;
    }

    if (curDefaultLanguage) {
      const translationEntries = await buildTranslations(
        translationsRef.current || {},
        curDefaultLanguage,
        isNonDefaultLang,
        currentLanguage,
        computedTitle,
        contentHtml,
        data,
      );

      if (translationEntries.length > 0) {
        input.translations = translationEntries;
      }
    }

    await savePost(input, data, options);
  };

  // Stable wrapper — safe to capture in onFormReady
  const onSubmit = useCallback(
    (data: PostFormData, options?: SubmitOptions) =>
      onSubmitRef.current(data, options),
    [],
  );

  return {
    onSubmit,
    creating,
    saving,
  };
};
