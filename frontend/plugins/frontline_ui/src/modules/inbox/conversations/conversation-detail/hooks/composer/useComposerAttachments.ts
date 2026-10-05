import { getBlockAttachments, toast } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MEDIA_BLOCK_TYPES } from '@/inbox/conversations/conversation-detail/constants/composer';
import type {
  ComposerBlockEditor,
  ComposerAttachmentsResult,
} from '@/inbox/conversations/conversation-detail/types/composer';

export const useComposerAttachments = (
  editor: ComposerBlockEditor,
): ComposerAttachmentsResult => {
  const { t } = useTranslation('frontline');
  const [uploadingGalleries, setUploadingGalleries] = useState<Set<string>>(
    new Set(),
  );
  const onGalleryUploadingChange = useCallback(
    (id: string, uploading: boolean): void => {
      setUploadingGalleries((current) => {
        const next = new Set(current);
        if (uploading) next.add(id);
        else next.delete(id);
        return next;
      });
    },
    [],
  );

  const removeBlockAttachment = useCallback(
    (url: string): void => {
      const blocks = editor.document.filter(
        (block) =>
          MEDIA_BLOCK_TYPES.has(block.type) &&
          'url' in block.props &&
          block.props.url === url,
      );
      if (!blocks.length) return;
      editor.removeBlocks(blocks);
      toast({ title: t('attachment-removed', 'Attachment removed') });
    },
    [editor, t],
  );

  const blockAttachments = getBlockAttachments(
    editor.document.filter((block) => block.type !== 'gallery'),
  );
  return {
    blockAttachments,
    removeBlockAttachment,
    isGalleryUploading: uploadingGalleries.size > 0,
    onGalleryUploadingChange,
  };
};
