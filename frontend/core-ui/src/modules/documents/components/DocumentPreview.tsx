import { useTranslation } from 'react-i18next';
import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { IDocument } from '../types';
import { loadDocumentBlocks } from '../utils/normalizeDocumentBlocks';

export const DocumentPreview = ({ document }: { document: IDocument }) => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const editor = useBlockEditor();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    setHasError(false);
    void loadDocumentBlocks(editor, document.content)
      .then((blocks) => {
        if (active) editor.replaceBlocks(editor.document, blocks);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => {
      active = false;
    };
  }, [document._id, document.content, editor]);

  if (hasError) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        {t('preview-unavailable')}
      </p>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="scale-[0.7] origin-top-left w-[333%] h-auto pointer-events-none select-none">
        <BlockEditor editor={editor} readonly className="py-8 px-4" />
      </div>
    </div>
  );
};
