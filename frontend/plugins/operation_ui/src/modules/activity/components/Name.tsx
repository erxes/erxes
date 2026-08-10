import { useTranslation } from 'react-i18next';
import { IActivity } from '@/activity/types';

export const Name = ({ metadata }: { metadata: IActivity['metadata'] }) => {
  const { t } = useTranslation('operation');
  return (
    <div>
      {t('renamed-the-task-to')}{' '}
      <span className="font-bold">"{metadata.newValue}"</span>
    </div>
  );
};
