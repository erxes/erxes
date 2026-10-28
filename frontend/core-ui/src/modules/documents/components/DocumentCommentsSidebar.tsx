import { useTranslation } from 'react-i18next';
import {
  ThreadsSidebar,
  useBlockNoteEditor,
  useThreads,
} from '@blocknote/react';

export const DocumentCommentsSidebar = () => {
  const { t } = useTranslation('documents', { keyPrefix: 'document' });
  const editor = useBlockNoteEditor();
  const threads = useThreads(editor);

  if (!threads.size) {
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        {t('no-comments')}
      </p>
    );
  }

  return <ThreadsSidebar filter="all" />;
};
