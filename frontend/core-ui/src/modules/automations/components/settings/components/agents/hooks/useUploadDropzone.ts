import {
  checkContextFiles,
  formatBytes,
  totalBytesOf,
} from '@/automations/components/settings/components/agents/utils/contextFileUpload';
import { TAiAgentContextFile } from '@/automations/components/settings/components/agents/utils/contextFiles';
import { toast, useUpload } from 'erxes-ui';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type TUploadedContextFile = {
  key: string;
  name: string;
  size?: number;
  type?: string;
  uploadedAt?: Date;
};

const toFileList = (files: File[]) => {
  const dataTransfer = new DataTransfer();

  files.forEach((file) => dataTransfer.items.add(file));

  return dataTransfer.files;
};

const isActivationKey = (key: string) => key === 'Enter' || key === ' ';

/**
 * The context file drop zone: dropping or picking files, refusing what breaks
 * a limit, uploading the rest and reporting them once all have uploaded.
 */
export const useUploadDropzone = ({
  files,
  maxFiles,
  maxSingleFileBytes,
  maxTotalContextBytes,
  onFilesUploaded,
}: {
  files: TAiAgentContextFile[];
  maxFiles: number;
  maxSingleFileBytes: number;
  maxTotalContextBytes: number;
  onFilesUploaded: (files: TUploadedContextFile[]) => void;
}) => {
  const { t } = useTranslation('automations');
  const [isDragOver, setIsDragOver] = useState(false);
  const { isLoading, upload } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const totalBytes = totalBytesOf(files);
  const canAddMore =
    files.length < maxFiles && totalBytes < maxTotalContextBytes;
  const isDisabled = !canAddMore || isLoading;

  const openFilePicker = useCallback(() => {
    if (!isDisabled) {
      inputRef.current?.click();
    }
  }, [isDisabled]);

  const uploadFiles = useCallback(
    (fileList: FileList) => {
      const result = checkContextFiles(Array.from(fileList), {
        existingCount: files.length,
        existingBytes: totalBytes,
        maxFiles,
        maxSingleFileBytes,
        maxTotalContextBytes,
      });

      if ('rejected' in result) {
        const { titleKey, descriptionKey, values } = result.rejected;

        toast({
          title: t(titleKey),
          description: t(descriptionKey, values),
          variant: 'destructive',
        });
        return;
      }

      if (!result.files.length) {
        return;
      }

      const uploaded: TUploadedContextFile[] = [];
      let remaining = result.files.length;

      upload({
        files: toFileList(result.files),
        afterUpload: ({ fileInfo, response }) => {
          const { name, size, type } = fileInfo;

          uploaded.push({
            name,
            size,
            key: response,
            type,
            uploadedAt: new Date(),
          });
          remaining -= 1;

          if (remaining === 0) {
            onFilesUploaded(uploaded);
          }
        },
      });
    },
    [
      files.length,
      totalBytes,
      maxFiles,
      maxSingleFileBytes,
      maxTotalContextBytes,
      onFilesUploaded,
      upload,
      t,
    ],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      if (!isDisabled) {
        uploadFiles(event.dataTransfer.files);
      }
    },
    [isDisabled, uploadFiles],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;

      if (fileList?.length) {
        uploadFiles(fileList);
      }

      event.target.value = '';
    },
    [uploadFiles],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (isActivationKey(event.key) && !isDisabled) {
        event.preventDefault();
        openFilePicker();
      }
    },
    [isDisabled, openFilePicker],
  );

  // The button sits inside the zone, which opens the picker on its own too
  const handleChooseClick = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      openFilePicker();
    },
    [openFilePicker],
  );

  return {
    inputRef,
    isDragOver,
    isLoading,
    canAddMore,
    isDisabled,
    usageStyle: {
      width: `${Math.min((totalBytes / maxTotalContextBytes) * 100, 100)}%`,
    },
    usedLabel: formatBytes(totalBytes),
    totalLabel: formatBytes(maxTotalContextBytes),
    openFilePicker,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleKeyDown,
    handleChooseClick,
  };
};
