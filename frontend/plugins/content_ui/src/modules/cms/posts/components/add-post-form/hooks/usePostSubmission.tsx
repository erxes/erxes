import { toast } from 'erxes-ui';
import { usePostMutations } from '../../../../hooks/usePostMutations';
import {
  makeAttachmentArrayFromUrls,
  normalizeAttachment,
} from '../../../formHelpers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRef, useEffect, useCallback } from 'react';

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
  description: string;
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
}

const blocksToHtml = (raw: string): string => {
  try {
    const blocks = JSON.parse(raw) as BlockContent[];

    if (!Array.isArray(blocks)) {
      return raw;
    }

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

const extractText = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const timestamp = Date.now().toString(36).slice(-6);

  return `${baseSlug || 'post'}-${timestamp}`;
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

export const usePostSubmission = ({
  websiteId,
  editingPost,
  selectedLanguage,
  defaultLanguage,
  defaultLangData,
  translations,
  onClose,
}: UsePostSubmissionProps) => {
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
   * onSubmitRef holds the latest submit implementation. The returned onSubmit
   * is a stable useCallback wrapper — safe to capture once in onFormReady.
   */
  const onSubmitRef = useRef<(data: PostFormData) => Promise<void>>(
    async () => {},
  );

  onSubmitRef.current = async (data: PostFormData) => {
    if (!data.type) {
      toast({
        title: 'Validation Error',
        description: 'Please select a post type',
        variant: 'destructive',
      });
      return;
    }

    const rawContent = data.content ?? '';

    const contentHtml = rawContent.trimStart().startsWith('[')
      ? blocksToHtml(rawContent)
      : rawContent;

    const computedTitle =
      data.title?.trim() ||
      data.seoTitle?.trim() ||
      extractText(contentHtml).split('\n')[0].slice(0, 80) ||
      'Untitled';

    const imagesPayload = makeAttachmentArrayFromUrls(data.gallery ?? []);
    const videoPayload = normalizeAttachment(data.video ?? undefined);
    const audioPayload = normalizeAttachment(data.audio ?? undefined);
    const documentsPayload = makeAttachmentArrayFromUrls(data.documents ?? []);
    const attachmentsPayload = makeAttachmentArrayFromUrls(
      data.attachments ?? [],
    );
    const pdfPayload = normalizeAttachment(data.pdf ?? undefined);

    const filteredCustomFields = data.customFieldsData?.filter(
      (item) =>
        item.value !== '' && item.value !== null && item.value !== undefined,
    );

    const currentLanguage = selectedLanguageRef.current;
    const curDefaultLanguage = defaultLanguageRef.current;
    const curDefaultLangData = defaultLangDataRef.current;
    const curTranslations = translationsRef.current || {};
    const isCreating = !editingPost?._id;
    const isNonDefaultLang =
      !!currentLanguage &&
      !!curDefaultLanguage &&
      currentLanguage !== curDefaultLanguage;

    // For new posts created while on a non-default language:
    // use defaultLangData for the main document, send current form data as translation
    let mainTitle = computedTitle;
    let mainContent = contentHtml;
    let mainExcerpt =
      data.description?.trim() === '' ? null : data.description?.trim();
    let mainCustomFields = filteredCustomFields;

    if (isCreating && isNonDefaultLang && curDefaultLangData) {
      mainTitle =
        curDefaultLangData.title?.trim() || computedTitle || 'Untitled';
      const rawDefault = curDefaultLangData.content ?? '';
      mainContent = rawDefault.trimStart().startsWith('[')
        ? blocksToHtml(rawDefault)
        : rawDefault;
      mainExcerpt = curDefaultLangData.description?.trim() || null;
      mainCustomFields = curDefaultLangData.customFieldsData?.filter(
        (item) =>
          item.value !== '' && item.value !== null && item.value !== undefined,
      );
    }

    const input: Record<string, unknown> = {
      clientPortalId: websiteId,
      title: mainTitle,
      slug: editingPost?._id ? data.slug : generateSlug(mainTitle),
      content: mainContent,
      type: data.type,
      status: data.status ?? 'draft',
      categoryIds: data.categoryIds,
      tagIds: data.tagIds,
      featured: data.featured,
      scheduledDate: data.scheduledDate ?? undefined,
      autoArchiveDate: data.enableAutoArchive
        ? data.autoArchiveDate
        : undefined,
      excerpt: mainExcerpt,
      thumbnail: normalizeAttachment(data.thumbnail ?? undefined),
      images: imagesPayload.length ? imagesPayload : undefined,
      video: videoPayload,
      videoUrl: data.videoUrl,
      audio: audioPayload,
      documents: documentsPayload.length ? documentsPayload : undefined,
      attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
      pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
      customFieldsData:
        mainCustomFields && mainCustomFields.length > 0
          ? mainCustomFields
          : undefined,
    };

    if (currentLanguage) {
      input.language = currentLanguage;
    }

    // Build translations array for create — includes all non-default language data
    if (isCreating && curDefaultLanguage) {
      const translationEntries: TranslationInput[] = [];

      // Add all previously saved translations from language switching
      for (const [lang, tData] of Object.entries(curTranslations)) {
        if (lang === curDefaultLanguage) continue;
        const hasData =
          tData.title ||
          tData.content ||
          tData.excerpt ||
          (tData.customFieldsData && tData.customFieldsData.length > 0);
        if (hasData) {
          const rawContent = tData.content || '';
          const normalizedContent = rawContent.trimStart().startsWith('[')
            ? blocksToHtml(rawContent)
            : rawContent;
          translationEntries.push({
            language: lang,
            title: tData.title || '',
            content: normalizedContent,
            excerpt: tData.excerpt || '',
            customFieldsData: tData.customFieldsData,
            type: 'post',
          });
        }
      }

      // Add current form data as translation if on non-default language
      // (it hasn't been saved to translations state yet)
      if (isNonDefaultLang) {
        // Remove any existing entry for current language (will be replaced)
        const idx = translationEntries.findIndex(
          (t) => t.language === currentLanguage,
        );
        if (idx >= 0) translationEntries.splice(idx, 1);

        translationEntries.push({
          language: currentLanguage,
          title: computedTitle,
          content: contentHtml,
          excerpt:
            data.description?.trim() === '' ? '' : data.description?.trim(),
          customFieldsData:
            filteredCustomFields && filteredCustomFields.length > 0
              ? filteredCustomFields
              : undefined,
          type: 'post',
        });
      }

      if (translationEntries.length > 0) {
        input.translations = translationEntries;
      }
    }

    try {
      if (editingPost?._id) {
        await editPost(editingPost._id, input);
        toast({ title: 'Saved', description: 'Post saved successfully' });
      } else {
        await createPost(input);
        toast({ title: 'Saved', description: 'Post created successfully' });
      }

      if (onClose) {
        onClose();
        return;
      }

      redirectToPosts(websiteId, searchParams, navigate);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save post';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  // Stable wrapper — safe to capture in onFormReady
  const onSubmit = useCallback(
    async (data: PostFormData) => onSubmitRef.current(data),
    [],
  );

  return {
    onSubmit,
    creating,
    saving,
  };
};
