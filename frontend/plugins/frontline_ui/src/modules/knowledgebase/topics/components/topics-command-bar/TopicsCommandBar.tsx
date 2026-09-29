import { useTranslation } from 'react-i18next';
import { KbSelectionCommandBar } from '@/knowledgebase/shared/components/KbSelectionCommandBar';
import { useRemoveTopics } from '@/knowledgebase/topics/hooks/useTopicMutations';

export const TopicsCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { removeTopics, loading } = useRemoveTopics();

  return (
    <KbSelectionCommandBar
      confirmMessage={(count) =>
        t('kb-confirm-delete-topics', {
          count,
          defaultValue: 'Are you sure you want to delete {{count}} topics?',
        })
      }
      removedMessage={t('kb-topics-deleted', 'Topics deleted')}
      remove={removeTopics}
      loading={loading}
    />
  );
};
