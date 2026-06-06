import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from '../constant';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
}) => {
  const { placeholder, uploadFile, ...restArgs } = args || {};

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
    placeholders: {
      default: placeholder || "Type '/' for commands...",
    },
    uploadFile,
    ...restArgs,
  });

  return editor;
};
