import { Cell } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useRemoveArticles } from '@/knowledgebase/articles/hooks/useArticleMutations';
import {
  KbRowActions,
  kbMoreColumn,
} from '@/knowledgebase/shared/components/KbRowActions';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';
import { IArticle } from '@/knowledgebase/types';

const ArticlesMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IArticle, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const { _id, title } = cell.row.original;
  const { removeArticles } = useRemoveArticles();
  const confirmRemove = useKbConfirmRemove();

  return (
    <KbRowActions
      id={_id}
      onDelete={() =>
        confirmRemove({
          message: t('kb-confirm-delete-article', {
            title: title || t('kb-untitled-article', 'Untitled article'),
            defaultValue: 'Are you sure you want to delete "{{title}}"?',
          }),
          removedMessage: t('kb-article-deleted', 'Article deleted'),
          remove: () => removeArticles([_id]),
        })
      }
    />
  );
};

export const articlesMoreColumn = kbMoreColumn<IArticle>(
  ArticlesMoreColumnCell,
);
