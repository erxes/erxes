import { useTranslation } from 'react-i18next';
import { useKbConfirmRemove } from '@/knowledgebase/shared/hooks/useKbConfirmRemove';
import { useRemoveTopics } from '@/knowledgebase/topics/hooks/useTopicMutations';

export const useConfirmRemoveTopic = () => {
  const { t } = useTranslation('frontline');
  const { removeTopics, loading } = useRemoveTopics();
  const confirmRemove = useKbConfirmRemove();

  const confirmRemoveTopic = (
    topic: { _id: string; title?: string },
    onRemoved?: () => void,
  ) =>
    confirmRemove({
      message: t('kb-confirm-delete-topic', {
        title: topic.title || t('unnamed-topic'),
        defaultValue:
          'Are you sure you want to delete "{{title}}"? All of its categories and articles will be removed.',
      }),
      removedMessage: t('kb-topic-deleted', 'Topic deleted'),
      remove: () => removeTopics([topic._id]),
      onRemoved,
    });

  return { confirmRemoveTopic, loading };
};
