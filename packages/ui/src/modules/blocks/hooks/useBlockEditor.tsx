import type { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import type { FieldControlProps } from 'erxes-ui/components/field-control';
import { useToast } from 'erxes-ui/hooks/use-toast';
import { errorMessage, storeFile } from 'erxes-ui/utils/file-storage';
import { readImage } from 'erxes-ui/utils/core';
import { BLOCK_SCHEMA, TABLE_SCHEMA } from 'erxes-ui/modules/blocks/constant/blockEditorSchema';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';
import { removeCodeFormattingFromHTML } from 'erxes-ui/modules/blocks/utils/removeCodeFormattingFromHTML';

export const useBlockEditor = (args?: {
  initialContent?: Block[];
  placeholder?: string;
  /** What screen readers call the editor; the placeholder when not given. */
  label?: string;
  uploadFile?: (file: File) => Promise<string>;
  /** The form row it's in (`useFieldControl()`): its label names the editor. */
  field?: FieldControlProps;
}): IBlockEditor => {
  const { initialContent, placeholder, label, uploadFile, field = {} } = args ?? {};

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

  const defaultPlaceholder = placeholder || "Type '/' for commands...";

  const editor = useCreateBlockNote({
    schema: BLOCK_SCHEMA,
    tables: TABLE_SCHEMA,
    placeholders: {
      default: defaultPlaceholder,
    },
    // A text box to assistive tech; BlockNote's "/" menu adds aria-autocomplete, which needs that role.
    domAttributes: {
      editor: {
        role: 'textbox',
        'aria-multiline': 'true',
        ...(field['aria-labelledby'] && !label
          ? { 'aria-labelledby': field['aria-labelledby'] }
          : { 'aria-label': label || defaultPlaceholder }),
        ...(field['aria-describedby'] && { 'aria-describedby': field['aria-describedby'] }),
        ...(field['aria-invalid'] && { 'aria-invalid': 'true' }),
        ...(field['aria-required'] && { 'aria-required': 'true' }),
      },
    },
    uploadFile: uploadFile ?? defaultUploadFile,
    resolveFileUrl: (url) => Promise.resolve(readImage(url)),
    initialContent,
  });

  useEffect(() => {
    const exportHTML = editor.blocksToHTMLLossy.bind(editor);

    editor.blocksToHTMLLossy = (blocks) => removeCodeFormattingFromHTML(exportHTML(blocks));

    return () => {
      editor.blocksToHTMLLossy = exportHTML;
    };
  }, [editor]);

  return editor;
};
