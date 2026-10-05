import type { Block } from '@blocknote/core';
import type {
  IAttachment,
  FileWithPreview,
  useBlockEditor,
  useErxesUpload,
} from 'erxes-ui';
import type { getGalleryImages } from '../utils/composer';
import type { useMessageAttachments } from '../hooks/useMessageAttachments';
import type { useResponseTemplateSuggestions } from '../hooks/useResponseTemplateSuggestions';

export type ComposerBlockEditor = ReturnType<typeof useBlockEditor>;

export type ComposerAttachmentsResult = {
  blockAttachments: IAttachment[];
  removeBlockAttachment: (url: string) => void;
  isGalleryUploading: boolean;
  onGalleryUploadingChange: (id: string, uploading: boolean) => void;
};

export type GalleryBlock = Extract<
  ComposerBlockEditor['document'][number],
  { type: 'gallery' }
>;

export type ComposerGalleriesProps = {
  editor: ComposerBlockEditor;
  disabled: boolean;
  onUploadingChange: (id: string, uploading: boolean) => void;
};

export type ComposerGalleryProps = ComposerGalleriesProps & {
  block: GalleryBlock;
};

export type ComposerGalleryResult = {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  uploading: boolean;
  images: ReturnType<typeof getGalleryImages>;
  attachments: IAttachment[];
  upload: ReturnType<typeof useErxesUpload>;
  pendingFiles: FileWithPreview[];
  handleUpload: (files: FileWithPreview[]) => Promise<void>;
  updateImages: (remaining: IAttachment[]) => void;
  removeGallery: () => void;
};

export type ComposerDraftOptions = {
  conversationId: string;
  integrationKind?: string;
  editor: ComposerBlockEditor;
  pingAgentTyping: () => void;
} & Pick<
  ReturnType<typeof useMessageAttachments>,
  'resetAttachments' | 'retainAttachments'
> &
  Pick<
    ReturnType<typeof useResponseTemplateSuggestions>,
    'resetSuggestions' | 'setResponseTemplateId' | 'setSearchValue'
  >;

export type ComposerDraftResult = {
  draftKey: string | null;
  content: Block[] | undefined;
  mentionedUserIds: string[];
  handleInternalNoteChange: (internal: boolean) => void;
  handleChange: () => Promise<void>;
  resetComposer: () => void;
  handlePartialDelivery: (remainingAttachments: IAttachment[]) => void;
};
