import { type IAttachment, toast, useUpload } from 'erxes-ui';
import { useCallback, useState, type ChangeEvent, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';

export type AttachmentPreview = Omit<IAttachment, 'url'> & { data: string };

export const useMessageAttachments = () => {
  const { t } = useTranslation('frontline');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<AttachmentPreview | null>(null);
  const { upload, isLoading: isUploading } = useUpload();

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files.length) return;

      upload({
        files,
        beforeUpload: () =>
          toast({ title: t('uploading-file'), variant: 'default' }),
        afterRead: ({ result, fileInfo }) =>
          setAttachmentPreview({ ...fileInfo, data: result }),
        afterUpload: ({ response, fileInfo }) => {
          setAttachments((current) => [
            ...current,
            { ...fileInfo, url: response },
          ]);
          setAttachmentPreview(null);
          toast({ title: t('file-uploaded-successfully'), variant: 'default' });
        },
      });
    },
    [t, upload],
  );

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    handleFileUpload(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    handleFileUpload(event.dataTransfer.files);
  };

  const handleDeleteAttachment = (name: string) => {
    setAttachments((current) =>
      current.filter((attachment) => attachment.name !== name),
    );
    toast({ title: t('attachment-removed'), variant: 'default' });
  };

  const resetAttachments = () => {
    setAttachments([]);
    setAttachmentPreview(null);
  };

  return {
    attachments,
    attachmentPreview,
    isUploading,
    handleDeleteAttachment,
    handleDrop,
    handleFileInput,
    resetAttachments,
  };
};
