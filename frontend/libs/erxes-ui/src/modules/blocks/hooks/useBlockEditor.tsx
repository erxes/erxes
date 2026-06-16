import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from '../constant';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
  selectMedia?: (options?: {
    fileType?: string;
    multiple?: boolean;
  }) => Promise<
    | {
        url: string;
        name?: string;
        fileType?: string;
        mimeType?: string;
      }
    | {
        url: string;
        name?: string;
        fileType?: string;
        mimeType?: string;
      }[]
    | null
  >;
}) => {
  const { placeholder, uploadFile, selectMedia, ...restArgs } = args || {};

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
    placeholders: {
      default: placeholder || "Type '/' for commands...",
    },
    uploadFile,
    ...restArgs,
  });

  (editor as any).selectMedia = selectMedia;

  return editor;
};
