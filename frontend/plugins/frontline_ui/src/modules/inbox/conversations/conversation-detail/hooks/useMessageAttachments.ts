import { useCallback, useRef, useState } from 'react';
import { toast, useUpload } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type AttachmentPreview = {
  name: string;
  type: string;
  size: number;
};

/** Manages composer attachment validation, uploads, and removal. */
export const useMessageAttachments = (isDiscord: boolean) => {
  const { t } = useTranslation('frontline');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<AttachmentPreview | null>(null);
  const pendingCountRef = useRef(0);
  const { upload, isLoading } = useUpload();

  /** Validates and uploads a selected group of files. */
  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files.length) return;

      const maximumBytes = isDiscord ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
      const selectedFiles = Array.from(files);
      const oversized = selectedFiles.find((file) => file.size > maximumBytes);

      if (oversized) {
        toast({
          title: t(
            'attachment-too-large',
            '{{name}} exceeds the {{size}} MB channel limit',
            {
              name: oversized.name,
              size: maximumBytes / 1024 / 1024,
            },
          ),
          variant: 'destructive',
        });
        return;
      }

      if (
        attachments.length + pendingCountRef.current + selectedFiles.length >
        10
      ) {
        toast({
          title: t(
            'attachment-limit-reached',
            'You can attach up to 10 files to one message',
          ),
          variant: 'destructive',
        });
        return;
      }

      pendingCountRef.current += selectedFiles.length;
      upload({
        files,
        beforeUpload: () =>
          toast({
            title: t('uploading-file', 'Uploading file...'),
            variant: 'default',
          }),
        afterRead: ({ fileInfo }) => setAttachmentPreview(fileInfo),
        afterUpload: ({ status, response, fileInfo }) => {
          if (status === 'ok') {
            setAttachments((current) => [
              ...current,
              { ...fileInfo, url: response },
            ]);
          }
          pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
          setAttachmentPreview(null);
          toast({
            title:
              status === 'ok'
                ? t('file-uploaded-successfully', 'File uploaded successfully!')
                : t('upload-failed', 'Upload failed'),
            variant: status === 'ok' ? 'default' : 'destructive',
          });
        },
      });
    },
    [attachments.length, isDiscord, t, upload],
  );

  /** Sends files selected through the hidden file input. */
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleFileUpload(event.target.files);
    event.target.value = '';
  };

  /** Sends files dropped onto the composer. */
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.files.length) return;
    event.preventDefault();
    event.stopPropagation();
    handleFileUpload(event.dataTransfer.files);
  };

  /** Removes an uploaded attachment from the pending message. */
  const handleDeleteAttachment = (url: string) => {
    setAttachments((current) =>
      current.filter((attachment) => attachment.url !== url),
    );
    toast({
      title: t('attachment-removed', 'Attachment removed'),
      variant: 'default',
    });
  };

  return {
    attachments,
    attachmentPreview,
    handleDeleteAttachment,
    handleDrop,
    handleFileInput,
    isLoading,
    setAttachmentPreview,
    setAttachments,
  };
};
