import { useTranslation } from 'react-i18next';
import { useRemoveArticles } from '@/knowledgebase/articles/hooks/useArticleMutations';
import { KbSelectionCommandBar } from '@/knowledgebase/shared/components/KbSelectionCommandBar';

export const ArticlesCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { removeArticles, loading } = useRemoveArticles();

  return (
    <KbSelectionCommandBar
      confirmMessage={(count) =>
        t('kb-confirm-delete-articles', {
          count,
          defaultValue: 'Are you sure you want to delete {{count}} articles?',
        })
      }
      removedMessage={t('kb-articles-deleted', 'Articles deleted')}
      remove={removeArticles}
      loading={loading}
    />
  );
};
