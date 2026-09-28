import {
  DocumentPickerDialog,
  getDocumentPreview,
  type EmailDocument,
} from '@/documents/components/DocumentPickerDialog';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { withEmailDocumentBlock } from 'erxes-ui';
import { useMemo, useRef, useState } from 'react';

/**
 * Gives the email editor a "Document" command. The editor that opened the
 * picker is kept, because the command runs before a document is chosen.
 */
export const useEmailDocumentBlock = () => {
  const [open, setOpen] = useState(false);
  const editorRef = useRef<TiptapEditor | null>(null);

  const blocks = useMemo(
    () =>
      withEmailDocumentBlock((editor) => {
        editorRef.current = editor;
        setOpen(true);
      }),
    [],
  );

  const handleSelect = (document: EmailDocument) => {
    editorRef.current
      ?.chain()
      .focus()
      .insertDocumentPlaceholder({
        documentId: document._id,
        documentName: document.name || 'Untitled document',
        documentCode: document.code || '',
        documentPreview: getDocumentPreview(document.content),
      })
      .run();
  };

  return {
    blocks,
    documentPicker: (
      <DocumentPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={handleSelect}
      />
    ),
  };
};
