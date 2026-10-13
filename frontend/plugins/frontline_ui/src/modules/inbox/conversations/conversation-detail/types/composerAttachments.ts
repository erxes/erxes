import type { IAttachment } from 'erxes-ui';

export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

export type PendingAttachment = Pick<IAttachment, 'name' | 'size' | 'type'> & {
  id: string;
  previewUrl?: string;
  uploadedUrl?: string;
};

export type ComposerPreviewsProps = {
  attachments: IAttachment[];
  blockAttachments: IAttachment[];
  pendingAttachments: PendingAttachment[];
  onRemove: (url: string) => void;
  onRemoveBlockAttachment: (url: string) => void;
};
