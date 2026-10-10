import { IconFileText } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ArticlesCommandBar } from '@/knowledgebase/articles/components/articles-command-bar/ArticlesCommandBar';
import { useArticlesColumns } from '@/knowledgebase/articles/components/ArticlesColumns';
import { useArticles } from '@/knowledgebase/articles/hooks/useArticles';
import { ARTICLES_TABLE_ID } from '@/knowledgebase/constants';
import { KbRecordTable } from '@/knowledgebase/shared/components/KbRecordTable';
import { KbEmptyState } from '@/knowledgebase/shared/components/KbStates';

export const ArticlesRecordTable = ({
  topicId,
  canCreate,
  onCreate,
}: {
  topicId: string;
  canCreate: boolean;
  onCreate: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { articles, loading, error, hasMore, fetchingMore, handleFetchMore } =
    useArticles(topicId);
  const columns = useArticlesColumns(topicId);

  return (
    <KbRecordTable
      columns={columns}
      data={articles || []}
      loading={loading}
      error={error}
      tableId={ARTICLES_TABLE_ID}
      hasMore={hasMore}
      fetchingMore={fetchingMore}
      onLoadMore={handleFetchMore}
      empty={
        <KbEmptyState
          icon={IconFileText}
          title={t('kb-no-articles-yet', 'There are no articles yet')}
          description={
            canCreate
              ? t(
                  'kb-no-articles-description',
                  'Write your first article for this topic.',
                )
              : t(
                  'kb-no-categories-first',
                  'Create a category first, then write articles in it.',
                )
          }
          action={
            canCreate ? (
              <Button variant="outline" onClick={onCreate}>
                {t('kb-create-article', 'Create Article')}
              </Button>
            ) : undefined
          }
        />
      }
      commandBar={<ArticlesCommandBar />}
    />
  );
};
