import { toast } from 'erxes-ui';
import { useAddPage } from '../../../hooks/useAddPage';
import { useEditPage } from '../../../hooks/useEditPage';
import { useNavigate } from 'react-router-dom';
import { PageFormData } from './usePageForm';
import {
  makeAttachmentArrayFromUrls,
  normalizeAttachment,
} from '~/modules/cms/posts/formHelpers';

interface IEditingPage {
  _id: string;
}

interface UsePageSubmissionProps {
  websiteId: string;
  editingPage?: IEditingPage;
  onClose?: () => void;
}

interface IInlineContent {
  text?: string;
  styles?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
  };
}

interface IBlock {
  type?: string;
  content?: IInlineContent[];
  props?: { level?: number };
}

interface IAttachmentInput {
  url: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

interface IPageInput {
  clientPortalId: string;
  name: string;
  slug: string;
  description?: string;
  content: string;
  status: string;
  parentId?: string;
  thumbnail?: IAttachmentInput;
  pageImages?: IAttachmentInput[];
  video?: IAttachmentInput;
  videoUrl?: string;
  audio?: IAttachmentInput;
  documents?: IAttachmentInput[];
  attachments?: IAttachmentInput[];
  pdfAttachment?: { pdf: IAttachmentInput };
  customFieldsData?: { field: string; value: unknown }[];
}

const applyInlineStyles = (i: IInlineContent): string => {
  let text = i.text || '';
  if (i.styles?.bold) text = `<strong>${text}</strong>`;
  if (i.styles?.italic) text = `<em>${text}</em>`;
  if (i.styles?.underline) text = `<u>${text}</u>`;
  if (i.styles?.strike) text = `<s>${text}</s>`;
  if (i.styles?.code) text = `<code>${text}</code>`;
  return text;
};

const blockToHtml = (block: IBlock): string => {
  const html = (block.content || []).map(applyInlineStyles).join('');
  if (block.type === 'heading') {
    const level = block.props?.level || 1;
    return `<h${level}>${html}</h${level}>`;
  }
  if (block.type === 'codeBlock') return `<pre><code>${html}</code></pre>`;
  return `<p>${html}</p>`;
};

const blocksToHtml = (raw: string): string => {
  try {
    const blocks: unknown = JSON.parse(raw);
    if (!Array.isArray(blocks)) return raw;
    return (blocks as IBlock[]).map(blockToHtml).join('');
  } catch {
    return raw;
  }
};

const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
  const timestamp = Date.now().toString(36).slice(-6);
  return `${baseSlug || 'page'}-${timestamp}`;
};

const getCustomFieldsData = (data: PageFormData) => {
  if (!data.customFieldsData || data.customFieldsData.length === 0) {
    return undefined;
  }
  const filtered = data.customFieldsData.filter(
    (item) =>
      item.value !== '' && item.value !== null && item.value !== undefined,
  );
  return filtered.length > 0 ? filtered : undefined;
};

export const usePageSubmission = ({
  websiteId,
  editingPage,
  onClose,
}: UsePageSubmissionProps) => {
  const navigate = useNavigate();
  const { addPage, loading: creating } = useAddPage();
  const { editPage, loading: saving } = useEditPage();

  const onSubmit = async (data: PageFormData) => {
    const rawContent = data.content || '';
    const contentHtml = rawContent.trimStart().startsWith('[')
      ? blocksToHtml(rawContent)
      : rawContent;

    const combinedImages = [...(data.gallery || [])];
    const imagesPayload = makeAttachmentArrayFromUrls(combinedImages);
    const videoPayload = normalizeAttachment(data.video || undefined);
    const audioPayload = normalizeAttachment(data.audio || undefined);
    const documentsPayload = makeAttachmentArrayFromUrls(data.documents || []);
    const attachmentsPayload = makeAttachmentArrayFromUrls(
      data.attachments || [],
    );

    const pdfPayload = normalizeAttachment(data.pdf || undefined);

    const input: IPageInput = {
      clientPortalId: websiteId,
      name: data.name,
      slug: editingPage?._id ? data.slug : generateSlug(data.name),
      description: data.description,
      content: contentHtml,
      status: data.status || 'active',
      parentId: data.parentId || undefined,
      thumbnail: normalizeAttachment(data.thumbnail || undefined),
      pageImages: imagesPayload.length ? imagesPayload : undefined,
      video: videoPayload,
      videoUrl: data.videoUrl,
      audio: audioPayload,
      documents: documentsPayload.length ? documentsPayload : undefined,
      attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
      pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
      customFieldsData: getCustomFieldsData(data),
    };

    try {
      if (editingPage?._id) {
        await editPage({
          variables: { _id: editingPage._id, input },
        });
        toast({ title: 'Saved', description: 'Page saved successfully' });
      } else {
        await addPage({ variables: { input } });
        toast({ title: 'Saved', description: 'Page created successfully' });
      }
      if (onClose) {
        onClose();
      } else {
        navigate(`/content/cms/${websiteId}/pages`);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to save page';
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
