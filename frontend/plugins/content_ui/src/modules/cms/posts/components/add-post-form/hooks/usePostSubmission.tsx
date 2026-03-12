import { toast } from 'erxes-ui';
import { usePostMutations } from '../../../../hooks/usePostMutations';
import {
  makeAttachmentArrayFromUrls,
  normalizeAttachment,
} from '../../../formHelpers';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: CustomField[];
}

interface UsePostSubmissionProps {
  websiteId: string;
  editingPost?: { _id?: string };
  onClose?: () => void;
}

/**
 * Converts editor block JSON into HTML.
 *
 * @param raw Raw editor JSON string
 * @returns HTML string
 */
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
  onClose,
}: UsePostSubmissionProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { createPost, editPost, creating, saving } = usePostMutations({
    websiteId,
  });

  const onSubmit = async (data: PostFormData) => {
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

    const input = {
      clientPortalId: websiteId,
      title: computedTitle,
      slug: editingPost?._id ? data.slug : generateSlug(computedTitle),
      content: contentHtml,
      type: data.type,
      status: data.status ?? 'draft',
      categoryIds: data.categoryIds,
      tagIds: data.tagIds,
      featured: data.featured,
      scheduledDate: data.scheduledDate ?? undefined,
      autoArchiveDate: data.enableAutoArchive
        ? data.autoArchiveDate
        : undefined,
      excerpt:
        data.description?.trim() === '' ? null : data.description?.trim(),
      thumbnail: normalizeAttachment(data.thumbnail ?? undefined),
      images: imagesPayload.length ? imagesPayload : undefined,
      video: videoPayload,
      audio: audioPayload,
      documents: documentsPayload.length ? documentsPayload : undefined,
      attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
      pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
      customFieldsData:
        filteredCustomFields && filteredCustomFields.length > 0
          ? filteredCustomFields
          : undefined,
    };

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

  return {
    onSubmit,
    creating,
    saving,
  };
};
