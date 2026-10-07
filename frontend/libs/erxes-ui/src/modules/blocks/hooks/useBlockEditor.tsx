import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useCallback, useEffect } from 'react';
import { useErxesUpload, useUploadChunked, useToast } from 'erxes-ui/hooks';
import { readImage } from 'erxes-ui/utils';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from '../constant';
import type { IBlockEditor } from '../types';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
}): IBlockEditor => {
  const { placeholder, uploadFile, ...restArgs } = args || {};

  const { uploadFile: uploadEditorFile } = useErxesUpload({ maxFiles: 1 });
  const { upload: uploadVideo, error: videoUploadError } = useUploadChunked();
  const { toast } = useToast();

  useEffect(() => {
    if (videoUploadError) {
      toast({
        title: 'Video upload failed',
        description: videoUploadError,
        variant: 'destructive',
      });
    }
  }, [videoUploadError, toast]);

  const defaultUploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (file.type.startsWith('video/')) {
        const video = await uploadVideo(file);

        if (!video?.url) {
          throw new Error('Video upload failed');
        }

        return video.url;
      }

      const result = await uploadEditorFile(file);

      if (!result.url) {
        throw new Error(result.message || 'Upload failed');
      }

      return result.url;
    },
    [uploadEditorFile, uploadVideo],
  );

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
    placeholders: {
      default: placeholder || "Type '/' for commands...",
    },
    uploadFile: uploadFile ?? defaultUploadFile,
    resolveFileUrl: (url) => Promise.resolve(readImage(url)),
    ...restArgs,
  });

  return editor;
};
