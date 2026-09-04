import { useCallback, useRef, useState } from 'react';
import { toast, useUpload } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IAttachment } from 'erxes-ui';

type AttachmentPreview = {
  name: string;
  type: string;
  size: number;
};

export const useMessageAttachments = (isDiscord: boolean) => {
  const { t } = useTranslation('frontline');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<AttachmentPreview | null>(null);
  const pendingCountRef = useRef(0);
  const { upload, isLoading } = useUpload();

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files.length) return;
      const maximumBytes = isDiscord ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
      const selectedFiles = Array.from(files);
      const oversized = selectedFiles.find((file) => file.size > maximumBytes);
      if (oversized) {
        toast({
          title: `${oversized.name} exceeds the ${maximumBytes / 1024 / 1024} MB channel limit`,
          variant: 'destructive',
        });
        return;
      }
      const reserved = selectedFiles.length;
      if (attachments.length + pendingCountRef.current + reserved > 10) {
        toast({
          title: 'You can attach up to 10 files to one message',
          variant: 'destructive',
        });
        return;
      }
      pendingCountRef.current += reserved;
      upload({
        files,
        beforeUpload: () =>
          toast({ title: t('uploading-file'), variant: 'default' }),
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
                ? t('file-uploaded-successfully')
                : 'Upload failed',
            variant: status === 'ok' ? 'default' : 'destructive',
          });
        },
      });
    },
    [attachments.length, isDiscord, t, upload],
  );
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleFileUpload(event.target.files);
    event.target.value = '';
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.files.length) return;
    event.preventDefault();
    event.stopPropagation();
    handleFileUpload(event.dataTransfer.files);
  };
  const handleDeleteAttachment = (url: string) => {
    setAttachments((current) => current.filter((file) => file.url !== url));
    toast({ title: t('attachment-removed'), variant: 'default' });
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
