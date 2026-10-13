import type { IAttachment } from 'erxes-ui';
import type { AttachmentKind } from '@/inbox/conversations/conversation-detail/types/composerAttachments';

export const getAttachmentKind = (attachment: IAttachment): AttachmentKind => {
  const type = attachment.type?.toLowerCase();
  const filename = `${attachment.name} ${attachment.url}`.toLowerCase();

  if (
    type?.startsWith('image') ||
    /\.(avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)(\?|\s|$)/.test(filename)
  ) {
    return 'image';
  }
  if (
    type?.startsWith('video') ||
    /\.(m4v|mkv|mov|mp4|ogv|webm)(\?|\s|$)/.test(filename)
  ) {
    return 'video';
  }
  if (
    type?.startsWith('audio') ||
    /\.(aac|flac|m4a|mp3|oga|ogg|wav)(\?|\s|$)/.test(filename)
  ) {
    return 'audio';
  }
  return 'file';
};

export const formatUploadedSize = (size: number) =>
  `${Math.max(1, Math.round(size / 1024))} KB`;
