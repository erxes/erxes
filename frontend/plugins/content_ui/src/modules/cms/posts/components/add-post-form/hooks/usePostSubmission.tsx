import { toast } from 'erxes-ui';
import { usePostMutations } from '../../../../hooks/usePostMutations';
import {
  makeAttachmentArrayFromUrls,
  normalizeAttachment,
} from '../../../formHelpers';
import { useNavigate } from 'react-router-dom';

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
  thumbnail?: any | null;
  gallery?: string[];
  video?: string | null;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: { field: string; value: any }[];
}

interface UsePostSubmissionProps {
  websiteId: string;
  editingPost?: any;
  selectedLanguage: string;
  defaultLanguage: string;
  translations: Record<string, any>;
  defaultLangData: {
    title: string;
    content: string;
    description: string;
    customFieldsData: any[];
  } | null;
  onClose?: () => void;
  currentPath?: string;
}

export const usePostSubmission = ({
  websiteId,
  editingPost,
  onClose,
}: UsePostSubmissionProps) => {
  const navigate = useNavigate();
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

    const extractText = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return (tmp.textContent || tmp.innerText || '').trim();
    };

    const computedTitle =
      (data.title && data.title.trim()) ||
      (data.seoTitle && data.seoTitle.trim()) ||
      extractText(data.content || '')
        .split('\n')[0]
        .slice(0, 80) ||
      'Untitled';

    const generateSlug = (title: string) => {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const timestamp = Date.now().toString(36).slice(-6);
      const finalSlug = baseSlug || 'post';
      return `${finalSlug}-${timestamp}`;
    };

    const combinedImages = [...(data.gallery || [])];
    const imagesPayload = makeAttachmentArrayFromUrls(combinedImages);
    const videoPayload = normalizeAttachment(data.video || undefined);
    const audioPayload = normalizeAttachment(data.audio || undefined);
    const documentsPayload = makeAttachmentArrayFromUrls(data.documents || []);
    const attachmentsPayload = makeAttachmentArrayFromUrls(
      data.attachments || [],
    );
    const pdfPayload = normalizeAttachment(data.pdf || undefined);

    const input: any = {
      clientPortalId: websiteId,
      title: computedTitle,
      slug: editingPost?._id ? data.slug : generateSlug(computedTitle),
      content: data.content,
      type: data.type,
      status: data.status || 'draft',
      categoryIds: data.categoryIds,
      tagIds: data.tagIds,
      featured: data.featured,
      scheduledDate: data.scheduledDate || undefined,
      autoArchiveDate: data.enableAutoArchive
        ? data.autoArchiveDate
        : undefined,
      excerpt:
        (data.description && data.description.trim()) ||
        extractText(data.content || '').slice(0, 200),
      thumbnail: normalizeAttachment(data.thumbnail || undefined),
      images: imagesPayload.length ? imagesPayload : undefined,
      video: videoPayload,
      audio: audioPayload,
      documents: documentsPayload.length ? documentsPayload : undefined,
      attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
      pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
      customFieldsData: (() => {
        if (!data.customFieldsData || data.customFieldsData.length === 0) {
          return undefined;
        }
        const filtered = data.customFieldsData.filter(
          (item) =>
            item.value !== '' &&
            item.value !== null &&
            item.value !== undefined,
        );
        return filtered.length > 0 ? filtered : undefined;
      })(),
    };

    try {
      if (editingPost?._id) {
        await editPost(editingPost._id, input);
        toast({ title: 'Saved', description: 'Post saved successfully' });
        if (onClose) {
          onClose();
        } else {
          navigate(`/content/cms/${websiteId}/posts`);
        }
      } else {
        await createPost(input);
        toast({ title: 'Saved', description: 'Post created successfully' });
        if (onClose) {
          onClose();
        } else {
          navigate(`/content/cms/${websiteId}/posts`);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save post',
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
