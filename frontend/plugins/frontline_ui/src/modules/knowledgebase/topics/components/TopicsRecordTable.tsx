import { TOPICS_TABLE_ID } from '@/knowledgebase/constants';
import { KbRecordTable } from '@/knowledgebase/shared/components/KbRecordTable';
import { TopicsCommandBar } from '@/knowledgebase/topics/components/topics-command-bar/TopicsCommandBar';
import { useTopicsColumns } from '@/knowledgebase/topics/components/TopicsColumns';
import { TopicsEmptyState } from '@/knowledgebase/topics/components/TopicsEmptyState';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';

export const TopicsRecordTable = ({ onCreate }: { onCreate: () => void }) => {
  const { topics, loading, error } = useTopics();
  const columns = useTopicsColumns();

  return (
    <KbRecordTable
      columns={columns}
      data={topics || []}
      loading={loading}
      error={error}
      tableId={TOPICS_TABLE_ID}
      empty={<TopicsEmptyState onCreate={onCreate} />}
      commandBar={<TopicsCommandBar />}
    />
  );
};
