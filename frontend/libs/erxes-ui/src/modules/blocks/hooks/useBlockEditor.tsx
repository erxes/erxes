import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useCallback, useEffect, useRef } from 'react';
import { useErxesUpload, FileWithPreview } from '../../../hooks/use-upload-new';
import { readImage } from '../../../utils/core';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from '../constant';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
}) => {
  const { placeholder, uploadFile, ...restArgs } = args || {};

  const pendingRef = useRef<{
    resolve: (url: string) => void;
    reject: (err: Error) => void;
  } | null>(null);

  const uploadProps = useErxesUpload({
    maxFiles: 1,
    onFilesAdded: (added) => {
      const pending = pendingRef.current;
      if (!pending) return;

      if (added[0]?.url) {
        pending.resolve(added[0].url);
      } else {
        pending.reject(new Error('Upload failed'));
      }
      pendingRef.current = null;
    },
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload().catch((err: unknown) => {
        pendingRef.current?.reject(
          err instanceof Error ? err : new Error('Upload failed'),
        );
        pendingRef.current = null;
      });
    }
  }, [uploadProps.files[0]]);

  const defaultUploadFile = useCallback(
    (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        pendingRef.current?.reject(
          new Error('Previous upload was interrupted'),
        );
        pendingRef.current = { resolve, reject };
        const fileWithPreview = Object.assign(file, {
          preview: URL.createObjectURL(file),
          errors: [],
        }) as FileWithPreview;
        uploadProps.setFiles([fileWithPreview]);
      });
    },
    [uploadProps.setFiles],
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
