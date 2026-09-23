import type { MessageInputAttachmentsResult } from '@/inbox/conversations/conversation-detail/types/messageInput';
import { toast, useUpload } from 'erxes-ui';

import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import type {
  MessageInputAttachment,
  MessageInputAttachmentPreview,
} from '@/inbox/conversations/conversation-detail/types/messageInput';

export const useMessageInputAttachments = (): MessageInputAttachmentsResult => {
  const { t } = useTranslation('frontline');
  const { upload, isLoading } = useUpload();
  const [attachments, setAttachments] = useState<MessageInputAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<MessageInputAttachmentPreview | null>(null);
  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files?.length) return;

      upload({
        files,
        beforeUpload: () =>
          toast({
            title: t('uploading-file', 'Uploading file...'),
            variant: 'default',
          }),
        afterRead: ({ result, fileInfo }) => {
          if (typeof result === 'string')
            setAttachmentPreview({ ...fileInfo, data: result });
        },
        afterUpload: ({ status, response, fileInfo }) => {
          if (status !== 'ok' || typeof response !== 'string') {
            setAttachmentPreview(null);
            toast({
              title: t('upload-failed', 'Upload failed'),
              variant: 'destructive',
            });
            return;
          }
          setAttachments((prev) => [...prev, { ...fileInfo, url: response }]);
          setAttachmentPreview(null);
          toast({
            title: t(
              'file-uploaded-successfully',
              'File uploaded successfully!',
            ),
            variant: 'default',
          });
        },
      });
    },
    [upload, t],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFileUpload(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((f) => f.name !== name));
    toast({
      title: t('attachment-removed', 'Attachment removed'),
      variant: 'default',
    });
  };

  return {
    attachments,
    setAttachments,
    attachmentPreview,
    setAttachmentPreview,
    isLoading,
    handleFileInput,
    handleDrop,
    handleDeleteAttachment,
  };
};
