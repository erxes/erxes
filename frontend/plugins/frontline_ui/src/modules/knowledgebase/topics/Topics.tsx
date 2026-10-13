import { IconPlus } from '@tabler/icons-react';
import { Button, Spinner, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { KNOWLEDGE_BASE_PATH } from '@/knowledgebase/constants';
import { KnowledgeBaseLayout } from '@/knowledgebase/shared/components/KnowledgeBaseLayout';
import { KbErrorState } from '@/knowledgebase/shared/components/KbStates';
import { TopicsEmptyState } from '@/knowledgebase/topics/components/TopicsEmptyState';
import { useTopics } from '@/knowledgebase/topics/hooks/useTopics';

const TopicsContent = ({
  loading,
  error,
  onCreate,
}: {
  loading: boolean;
  error?: { message: string };
  onCreate: () => void;
}) => {
  if (loading) {
    return (
      <div className="flex flex-auto justify-center items-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <KbErrorState message={error.message} />;
  }

  return <TopicsEmptyState onCreate={onCreate} />;
};

export const Topics = () => {
  const { t } = useTranslation('frontline');
  const { search } = useLocation();
  const [, setCreateTopic] = useQueryState<string>('createTopic');
  const { topics, loading, error } = useTopics();

  const firstTopic = topics?.[0];
  const openCreateTopic = () => setCreateTopic('true');

  if (firstTopic) {
    return (
      <Navigate
        replace
        to={{
          pathname: `${KNOWLEDGE_BASE_PATH}/${firstTopic._id}/articles`,
          search,
        }}
      />
    );
  }

  return (
    <KnowledgeBaseLayout
      actions={
        <Button onClick={openCreateTopic} className="py-1 h-7">
          <IconPlus />
          {t('kb-new-topic', 'New Topic')}
        </Button>
      }
    >
      <TopicsContent
        loading={loading}
        error={error}
        onCreate={openCreateTopic}
      />
    </KnowledgeBaseLayout>
  );
};
