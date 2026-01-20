import { REACT_APP_API_URL, useToast, useUpload } from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { useCallback, useState } from 'react';
import {
  IconPhotoScan,
  IconVideo,
  IconMusic,
  IconFile,
} from '@tabler/icons-react';

const getFileTypeConst = (
  mimeType: string,
): { icon: React.ElementType; label: string } => {
  if (mimeType.startsWith('image/')) {
    return { icon: IconPhotoScan, label: 'Image' };
  }
  if (mimeType.startsWith('video/')) {
    return { icon: IconVideo, label: 'Video' };
  }
  if (mimeType.startsWith('audio/')) {
    return { icon: IconMusic, label: 'Audio' };
  }
  return { icon: IconFile, label: 'Attachment' };
};

const checkIsImageType = (mimeType: string) => mimeType.startsWith('image/');

export const useIgBotFileUploadSection = ({
  url,
  mimeType,
  limit,
  onUpload,
}: {
  url?: string;
  mimeType: string;
  limit: number;
  onUpload?: (fileUrl: string | null) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(
    url || null,
  );
  const [uploadedFileMimeType, setUploadedFileMimeType] =
    useState<string>(mimeType);
  const { isLoading, upload } = useUpload();
  const { toast } = useToast();

  const sizeLimit = limit * 1024 * 1024;
  const isImageType = checkIsImageType(mimeType);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClear = useCallback(() => {
    if (uploadedFileUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(uploadedFileUrl);
    }
    setUploadedFileUrl(null);
    setUploadedFileMimeType(mimeType);
    onUpload?.(null);
  }, [uploadedFileUrl, onUpload, mimeType]);

  const handleCopyUrl = useCallback(() => {
    if (!uploadedFileUrl) return;

    navigator.clipboard.writeText(uploadedFileUrl);
    toast({
      title: 'URL copied to clipboard',
      variant: 'default',
    });
  }, [uploadedFileUrl, toast]);

  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files || files.length === 0) return;

      const file = files[0];

      if (file.size > sizeLimit) {
        toast({
          title: 'File size exceeds limit',
          description: `File size must be less than ${limit}MB`,
          variant: 'destructive',
        });
        return;
      }

      upload({
        files,
        afterUpload: ({ fileInfo, response }) => {
          const fileUrl =
            url ||
            (isImageType
              ? readImage(response)
              : `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
                  response,
                )}`);

          setUploadedFileUrl(fileUrl);
          setUploadedFileMimeType(fileInfo.type);
          onUpload?.(fileUrl);

          toast({
            title: 'File uploaded successfully',
            variant: 'default',
          });
        },
      });
    },
    [upload, sizeLimit, limit, toast, onUpload, url],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        handleFileUpload(fileList);
      }
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFileUpload],
  );

  const { icon: FileIcon, label } = getFileTypeConst(uploadedFileMimeType);
  return {
    uploadedFileUrl,
    isImageType,
    isDragOver,
    FileIcon,
    label,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleClear,
    handleCopyUrl,
    isLoading,
  };
};
