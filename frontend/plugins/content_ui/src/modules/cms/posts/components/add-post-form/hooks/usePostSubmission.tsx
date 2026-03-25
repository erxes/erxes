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
    url?: string;
    caption?: string;
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
}

interface MainFields {
  title: string;
  content: string;
  excerpt: string | null | undefined;
  customFields: CustomField[] | undefined;
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

    if (!Array.isArray(blocks)) {
      return raw;
    }

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

        if (block.type === 'image') {
          const url = block.props?.url;
          if (!url) return '';
          const caption = block.props?.caption || '';
          const img = `<img src="${url}"${
            caption ? ` alt="${caption}"` : ''
          } />`;
          return caption
            ? `<figure>${img}<figcaption>${caption}</figcaption></figure>`
            : img;
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

const computeTitle = (data: PostFormData, contentHtml: string): string => {
  return (
    data.title?.trim() ||
    data.seoTitle?.trim() ||
    extractText(contentHtml).split('\n')[0].slice(0, 80) ||
    'Untitled'
  );
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

const normalizeContent = (raw: string): string => {
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

const resolveMainFields = (
  data: PostFormData,
  computedTitle: string,
  contentHtml: string,
  isCreating: boolean,
  isNonDefaultLang: boolean,
  curDefaultLangData: DefaultLangData | null | undefined,
): MainFields => {
  if (isCreating && isNonDefaultLang && curDefaultLangData) {
    return {
      title: curDefaultLangData.title?.trim() || computedTitle || 'Untitled',
      content: normalizeContent(curDefaultLangData.content ?? ''),
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

  return {
    clientPortalId: websiteId,
    title: main.title,
    slug: editingPostId ? data.slug : generateSlug(main.title),
    content: main.content,
    type: data.type,
    status: data.status ?? 'draft',
    categoryIds: data.categoryIds,
    tagIds: data.tagIds,
    featured: data.featured,
    publishedDate: data.publishDate ?? undefined,
    scheduledDate: data.scheduledDate ?? undefined,
    autoArchiveDate: data.enableAutoArchive ? data.autoArchiveDate : undefined,
    excerpt: main.excerpt,
    thumbnail: normalizeAttachment(data.thumbnail ?? undefined),
    images: imagesPayload.length ? imagesPayload : undefined,
    video: videoPayload,
    videoUrl: data.videoUrl,
    audio: audioPayload,
    documents: documentsPayload.length ? documentsPayload : undefined,
    attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
    pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
    customFieldsData: main.customFields,
  };
};

const buildTranslations = (
  curTranslations: Record<string, TranslationEntry>,
  curDefaultLanguage: string,
  isNonDefaultLang: boolean,
  currentLanguage: string | undefined,
  computedTitle: string,
  contentHtml: string,
  data: PostFormData,
): TranslationInput[] => {
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
      content: normalizeContent(tData.content || ''),
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

  const savePost = async (input: Record<string, unknown>) => {
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

  /**
   * onSubmitRef holds the latest submit implementation. The returned onSubmit
   * is a stable useCallback wrapper — safe to capture once in onFormReady.
   */
  // No-op placeholder — immediately replaced below on every render
  const onSubmitRef = useRef<(data: PostFormData) => Promise<void>>(
    async () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
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

    const contentHtml = normalizeContent(data.content ?? '');
    const computedTitle = computeTitle(data, contentHtml);

    const currentLanguage = selectedLanguageRef.current;
    const curDefaultLanguage = defaultLanguageRef.current;
    const isCreating = !editingPost?._id;
    const isNonDefaultLang =
      Boolean(currentLanguage) &&
      Boolean(curDefaultLanguage) &&
      currentLanguage !== curDefaultLanguage;

    const main = resolveMainFields(
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

    if (isCreating && curDefaultLanguage) {
      const translationEntries = buildTranslations(
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

    await savePost(input);
  };

  // Stable wrapper — safe to capture in onFormReady
  const onSubmit = useCallback(
    (data: PostFormData) => onSubmitRef.current(data),
    [],
  );

  return {
    onSubmit,
    creating,
    saving,
  };
};
