import { StatusGroup } from '@/team/components/status/StatusGroup';
import { TeamStatusTypes } from '@/team/constants';
import { useTranslation } from 'react-i18next';

export const Statuses = () => {
  const { t } = useTranslation('operation');
  return (
    <div className="w-full px-4 sm:px-8 lg:px-16">
      <h1 className="text-2xl font-semibold">{t('task-statuses')}</h1>
      <div className="mt-4 w-full border border-muted-foreground/15 rounded-md">
        {Object.values(TeamStatusTypes).map((statusType) => (
          <StatusGroup key={statusType} statusType={statusType} />
        ))}
      </div>
    </div>
  );
};
