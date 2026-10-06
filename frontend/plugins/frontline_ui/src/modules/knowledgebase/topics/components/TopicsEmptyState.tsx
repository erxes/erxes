import { IconBook } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { KbEmptyState } from '@/knowledgebase/shared/components/KbStates';

export const TopicsEmptyState = ({ onCreate }: { onCreate: () => void }) => {
  const { t } = useTranslation('frontline');

  return (
    <KbEmptyState
      icon={IconBook}
      title={t('kb-no-topics-yet', 'There are no topics yet')}
      description={t(
        'kb-no-topics-description',
        'Create your first topic and start your knowledge base.',
      )}
      action={
        <Button variant="outline" onClick={onCreate}>
          {t('kb-create-topic', 'Create Topic')}
        </Button>
      }
    />
  );
};
