import { IActivity } from '@/activity/types';
import { useTranslation } from 'react-i18next';

export const Name = ({ metadata }: { metadata: IActivity['metadata'] }) => {
  const { t } = useTranslation('frontline');
  return (
    <div>
      {t('renamed-the-task-to')}{' '}
      <span className="font-bold">"{metadata.newValue}"</span>
    </div>
  );
};
