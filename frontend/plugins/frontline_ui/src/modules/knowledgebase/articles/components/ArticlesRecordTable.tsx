import { IconAlertCircle, IconFileText } from '@tabler/icons-react';
import { Button, Empty, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ArticlesCommandBar } from '@/knowledgebase/articles/components/articles-command-bar/ArticlesCommandBar';
import { useArticlesColumns } from '@/knowledgebase/articles/components/ArticlesColumns';
import { useArticles } from '@/knowledgebase/articles/hooks/useArticles';
import { ARTICLES_TABLE_ID } from '@/knowledgebase/constants';

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
  const { articles, loading, error } = useArticles(topicId);
  const columns = useArticlesColumns(topicId);

  if (error) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{error.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  if (!loading && articles?.length === 0) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconFileText />
          </Empty.Media>
          <Empty.Title>
            {t('kb-no-articles-yet', 'There are no articles yet')}
          </Empty.Title>
          <Empty.Description>
            {canCreate
              ? t(
                  'kb-no-articles-description',
                  'Write your first article for this topic.',
                )
              : t(
                  'kb-no-categories-first',
                  'Create a category first, then write articles in it.',
                )}
          </Empty.Description>
        </Empty.Header>
        {canCreate && (
          <Empty.Content>
            <Button variant="outline" onClick={onCreate}>
              {t('kb-create-article', 'Create Article')}
            </Button>
          </Empty.Content>
        )}
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={articles || []}
      stickyColumns={['more', 'checkbox', 'title']}
      className="m-3"
      tableId={ARTICLES_TABLE_ID}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading ? (
              <RecordTable.RowSkeleton rows={10} />
            ) : (
              <RecordTable.RowList />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ArticlesCommandBar />
    </RecordTable.Provider>
  );
};
