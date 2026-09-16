import { useCallback, useEffect, useRef, useState } from 'react';
import { toast, useUpload, type IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const MAX_ATTACHMENTS = 10;
const DEFAULT_MAXIMUM_BYTES = 20 * 1024 * 1024;
const DISCORD_MAXIMUM_BYTES = 10 * 1024 * 1024;

export type PendingAttachment = Pick<IAttachment, 'name' | 'size' | 'type'> & {
  id: string;
};

export const useMessageAttachments = (isDiscord: boolean) => {
  const { t } = useTranslation('frontline');
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const pendingCountRef = useRef(0);
  const { upload, isLoading } = useUpload();

  useEffect(() => {
    if (!isLoading) {
      pendingCountRef.current = 0;
      setPendingAttachments([]);
    }
  }, [isLoading]);

  const uploadFiles = useCallback(
    (files: FileList) => {
      if (!files.length) return;

      const selectedFiles = Array.from(files);
      const configuredMaximumBytes =
        Number.parseInt(
          window.localStorage.getItem(
            'erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE',
          ) || '',
          10,
        ) || DEFAULT_MAXIMUM_BYTES;
      const maximumBytes = Math.min(
        configuredMaximumBytes,
        isDiscord ? DISCORD_MAXIMUM_BYTES : DEFAULT_MAXIMUM_BYTES,
      );
      const oversizedFile = selectedFiles.find(
        (file) => file.size > maximumBytes,
      );

      if (oversizedFile) {
        toast({
          title: t(
            'attachment-too-large',
            '{{name}} exceeds the {{size}} MB attachment limit',
            {
              name: oversizedFile.name,
              size: maximumBytes / 1024 / 1024,
            },
          ),
          variant: 'destructive',
        });
        return;
      }

      if (
        attachments.length + pendingCountRef.current + selectedFiles.length >
        MAX_ATTACHMENTS
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

      setPendingAttachments((current) => [
        ...current,
        ...selectedFiles.map(({ name, size, type }) => ({
          id: crypto.randomUUID(),
          name,
          size,
          type,
        })),
      ]);
      pendingCountRef.current += selectedFiles.length;

      upload({
        files,
        afterUpload: ({ status, response, fileInfo }) => {
          pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
          setPendingAttachments((current) => {
            const index = current.findIndex(
              (file) =>
                file.name === fileInfo.name && file.size === fileInfo.size,
            );

            return index < 0
              ? current
              : current.filter((_, currentIndex) => currentIndex !== index);
          });

          if (status !== 'ok') {
            toast({
              title: t('upload-failed', 'Upload failed'),
              variant: 'destructive',
            });
            return;
          }

          setAttachments((current) => [
            ...current,
            { ...fileInfo, url: response },
          ]);
          toast({
            title: t(
              'file-uploaded-successfully',
              'File uploaded successfully!',
            ),
          });
        },
      });
    },
    [attachments.length, isDiscord, t, upload],
  );

  const handleFileInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!event.target.files) return;
      uploadFiles(event.target.files);
      event.target.value = '';
    },
    [uploadFiles],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (!event.dataTransfer.files.length) return;
      event.preventDefault();
      event.stopPropagation();
      uploadFiles(event.dataTransfer.files);
    },
    [uploadFiles],
  );

  const removeAttachment = useCallback(
    (url: string) => {
      setAttachments((current) =>
        current.filter((attachment) => attachment.url !== url),
      );
      toast({
        title: t('attachment-removed', 'Attachment removed'),
      });
    },
    [t],
  );

  const resetAttachments = useCallback(() => {
    pendingCountRef.current = 0;
    setAttachments([]);
    setPendingAttachments([]);
  }, []);

  return {
    attachments,
    pendingAttachments,
    handleDrop,
    handleFileInput,
    removeAttachment,
    resetAttachments,
    isUploading: isLoading,
  };
};
