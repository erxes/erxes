import type { Block } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('ui', { keyPrefix: 'editor' });

  const defaultUploadFile = async (file: File) => {
    try {
      return await storeFile(file);
    } catch (error) {
      toast({
        title: t('upload-failed', 'Could not upload the file'),
        description: errorMessage(error, t('upload-failed-reason', 'Upload failed')),
        variant: 'destructive',
      });
      throw error;
    }
  };

  const defaultPlaceholder = placeholder || t('placeholder', 'Type “/” for commands…');

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
      },
    },
    uploadFile: uploadFile ?? defaultUploadFile,
    resolveFileUrl: (url) => Promise.resolve(readImage(url)),
    initialContent,
  });

  const describedBy = field['aria-describedby'];
  const invalid = field['aria-invalid'];
  const required = field['aria-required'];

  // The row's hint or error, and whether it's invalid, change after the editor is made.
  useEffect(() => {
    const element = editor.domElement;

    if (!element) return;

    const state = {
      'aria-describedby': describedBy,
      'aria-invalid': invalid ? 'true' : undefined,
      'aria-required': required ? 'true' : undefined,
    };

    for (const [name, value] of Object.entries(state)) {
      if (value) element.setAttribute(name, value);
      else element.removeAttribute(name);
    }
  }, [editor, describedBy, invalid, required]);

  useEffect(() => {
    const exportHTML = editor.blocksToHTMLLossy.bind(editor);

    editor.blocksToHTMLLossy = (blocks) => removeCodeFormattingFromHTML(exportHTML(blocks));

    return () => {
      editor.blocksToHTMLLossy = exportHTML;
    };
  }, [editor]);

  return editor;
};
