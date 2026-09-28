import type { IAttachment } from 'erxes-ui';

export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

export type PendingAttachment = Pick<IAttachment, 'name' | 'size' | 'type'> & {
  id: string;
  previewUrl?: string;
  uploadedUrl?: string;
};
