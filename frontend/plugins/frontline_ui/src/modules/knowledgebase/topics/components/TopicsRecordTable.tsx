import { IconAlertCircle, IconBook } from '@tabler/icons-react';
import { Button, Empty, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TOPICS_TABLE_ID } from '@/knowledgebase/constants';
import { TopicsCommandBar } from '@/knowledgebase/topics/components/topics-command-bar/TopicsCommandBar';
import { useTopicsColumns } from '@/knowledgebase/topics/components/TopicsColumns';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';

export const TopicsRecordTable = ({ onCreate }: { onCreate: () => void }) => {
  const { t } = useTranslation('frontline');
  const { topics, loading, error } = useTopics();
  const columns = useTopicsColumns();

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

  if (!loading && topics?.length === 0) {
    return (
      <Empty className="m-3 rounded-lg bg-sidebar">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconBook />
          </Empty.Media>
          <Empty.Title>
            {t('kb-no-topics-yet', 'There are no topics yet')}
          </Empty.Title>
          <Empty.Description>
            {t(
              'kb-no-topics-description',
              'Create your first topic and start your knowledge base.',
            )}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <Button variant="outline" onClick={onCreate}>
            {t('kb-create-topic', 'Create Topic')}
          </Button>
        </Empty.Content>
      </Empty>
    );
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={topics || []}
      stickyColumns={['more', 'checkbox', 'title']}
      className="m-3"
      tableId={TOPICS_TABLE_ID}
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
      <TopicsCommandBar />
    </RecordTable.Provider>
  );
};
