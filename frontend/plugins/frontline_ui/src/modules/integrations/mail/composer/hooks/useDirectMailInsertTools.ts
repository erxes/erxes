import { useDirectMailComposerContext } from '@/integrations/mail/composer/hooks/useDirectMailComposerFields';
import type { DirectMailInsertToolsState } from '@/integrations/mail/composer/types/directMailInsertTools';
import type { MailAttachmentInput } from '@/integrations/mail/types/mailDelivery';
import { toast } from 'erxes-ui';
import type { ChangeEvent } from 'react';
import { useRef } from 'react';

export const useDirectMailInsertTools = (): DirectMailInsertToolsState => {
  const {
    editor,
    setUploading: onUploadingChange,
    setAttachments,
  } = useDirectMailComposerContext();
  const onAttachment = (attachment: MailAttachmentInput) =>
    setAttachments((items) => [
      ...items,
      { ...attachment, id: crypto.randomUUID() },
    ]);
  const fileInput = useRef<HTMLInputElement>(null);
  const attachmentInput = useRef<HTMLInputElement>(null);
  const uploadAttachment = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor.uploadFile) return;
    onUploadingChange(true);
    try {
      const uploaded = await editor.uploadFile(file);
      if (typeof uploaded !== 'string')
        throw new Error('Unable to upload attachment');
      onAttachment({
        url: uploaded,
        name: file.name,
        type: file.type,
        size: file.size,
        disposition: 'attachment',
      });
    } catch (error) {
      toast({
        title: 'Attachment upload failed',
        description: error instanceof Error ? error.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      onUploadingChange(false);
    }
  };
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editor.uploadFile) return;
    onUploadingChange(true);
    try {
      const uploaded = await editor.uploadFile(file);
      if (typeof uploaded !== 'string')
        throw new Error('Unable to upload image');
      editor.insertBlocks(
        [{ type: 'image', props: { url: uploaded, name: file.name } }],
        editor.getTextCursorPosition().block,
        'after',
      );
      editor.focus();
    } catch (error) {
      toast({
        title: 'Image upload failed',
        description: error instanceof Error ? error.message : 'Try again',
        variant: 'destructive',
      });
    } finally {
      onUploadingChange(false);
    }
  };
  return {
    fileInput,
    attachmentInput,
    uploadAttachment,
    uploadImage,
  };
};
