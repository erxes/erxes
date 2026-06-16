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

  const resolveRef = useRef<(url: string) => void>();
  const rejectRef = useRef<(err: Error) => void>();
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  const uploadProps = useErxesUpload({
    maxFiles: 1,
    onFilesAdded: (added) => {
      if (added[0]?.url) {
        resolveRef.current?.(added[0].url);
      } else {
        rejectRef.current?.(new Error('Upload failed'));
      }
    },
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload().catch((err: unknown) => {
        rejectRef.current?.(
          err instanceof Error ? err : new Error('Upload failed'),
        );
      });
    }
  }, [uploadProps.files.length]);

  const defaultUploadFile = useCallback(
    (file: File): Promise<string> => {
      const runUpload = () =>
        new Promise<string>((resolve, reject) => {
          resolveRef.current = resolve;
          rejectRef.current = reject;
          const fileWithPreview = Object.assign(file, {
            preview: URL.createObjectURL(file),
            errors: [],
          }) as FileWithPreview;
          uploadProps.setFiles([fileWithPreview]);
        });

      const promise = queueRef.current.then(runUpload);
      queueRef.current = promise.then(
        () => {
          uploadProps.setFiles([]);
        },
        () => {
          uploadProps.setFiles([]);
        },
      );
      return promise;
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
