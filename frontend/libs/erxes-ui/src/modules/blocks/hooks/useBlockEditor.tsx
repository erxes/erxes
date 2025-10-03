import { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from '../constant';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
}) => {
  const { placeholder, ...restArgs } = args || {};

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
    placeholders: {
      default: placeholder || "Type '/' for commands...",
    },
    ...restArgs,
  });

  return editor;
};
