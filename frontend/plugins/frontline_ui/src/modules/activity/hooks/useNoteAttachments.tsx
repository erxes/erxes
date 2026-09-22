import type { INoteAttachment } from '@/activity/types';
import { toast, useUpload } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export const useNoteAttachments = () => {
  const { t } = useTranslation('frontline');
  const { upload, isLoading } = useUpload();
  const [attachments, setAttachments] = useState<INoteAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<INoteAttachment | null>(null);

  const uploadFiles = useCallback(
    (files: FileList) => {
      if (!files?.length) return;

      upload({
        files,
        beforeUpload: () =>
          toast({ title: t('uploading-file'), variant: 'default' }),
        afterRead: ({ result, fileInfo }) =>
          setAttachmentPreview({ ...fileInfo, data: result as string }),
        afterUpload: ({ response, fileInfo }) => {
          setAttachments((prev) => [...prev, { ...fileInfo, url: response }]);
          setAttachmentPreview(null);
          toast({ title: t('file-uploaded-successfully'), variant: 'default' });
        },
      });
    },
    [upload, t],
  );

  const removeAttachment = useCallback(
    (name: string) => {
      setAttachments((prev) => prev.filter((file) => file.name !== name));
      toast({ title: t('attachment-removed'), variant: 'default' });
    },
    [t],
  );

  const resetAttachments = useCallback(() => {
    setAttachments([]);
    setAttachmentPreview(null);
  }, []);

  return {
    attachments,
    attachmentPreview,
    isUploading: isLoading,
    uploadFiles,
    removeAttachment,
    resetAttachments,
  };
};
