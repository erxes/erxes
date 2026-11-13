import type { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import { useToast } from 'erxes-ui/hooks/use-toast';
import { errorMessage, storeFile } from 'erxes-ui/utils/file-storage';
import { readImage } from 'erxes-ui/utils/core';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from 'erxes-ui/modules/blocks/constant/blockEditorSchema';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import { removeCodeFormattingFromHTML } from 'erxes-ui/modules/blocks/utils/removeCodeFormattingFromHTML';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  uploadFile?: (file: File) => Promise<string>;
}): IBlockEditor => {
  const { initialContent, placeholder, uploadFile } = args ?? {};

  const { toast } = useToast();

  const defaultUploadFile = async (file: File) => {
    try {
      return await storeFile(file);
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: errorMessage(error, 'Upload failed'),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
    placeholders: {
      default: placeholder || "Type '/' for commands...",
    },
    uploadFile: uploadFile ?? defaultUploadFile,
    resolveFileUrl: (url) => Promise.resolve(readImage(url)),
    initialContent,
  });

  useEffect(() => {
    const exportHTML = editor.blocksToHTMLLossy.bind(editor);

    // oxlint-disable-next-line react/immutability -- useCreateBlockNote builds the editor; plugins call its blocksToHTMLLossy, so the clean export can only wrap that method
    editor.blocksToHTMLLossy = async (blocks) =>
      removeCodeFormattingFromHTML(await exportHTML(blocks));

    return () => {
      editor.blocksToHTMLLossy = exportHTML;
    };
  }, [editor]);

  return editor;
};
