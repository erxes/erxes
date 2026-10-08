import { IconCopy } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  useDuplicateArticle,
  useRemoveArticles,
} from '@/knowledgebase/articles/hooks/useArticleMutations';
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
  const article = cell.row.original;
  const { _id, title } = article;
  const { removeArticles } = useRemoveArticles();
  const { topicId = '' } = useParams();
  const { duplicateArticle } = useDuplicateArticle(topicId);
  const confirmRemove = useKbConfirmRemove();

  return (
    <KbRowActions
      id={_id}
      actions={[
        {
          value: 'duplicate',
          icon: IconCopy,
          label: t('kb-duplicate', 'Duplicate'),
          onSelect: () => duplicateArticle(article),
        },
      ]}
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
