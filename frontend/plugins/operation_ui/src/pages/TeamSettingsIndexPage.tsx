import { useTranslation } from 'react-i18next';
import { Teams } from '@/team/components/team-list/Teams';
import { CreateTeam } from '@/team/components/team-list/CreateTeam';

export const TeamsSettingsPage = () => {
  const { t } = useTranslation('operation');
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="w-full flex justify-between items-center px-8 py-6">
        <h1 className="text-xl font-semibold">{t('teams')}</h1>
        <CreateTeam />
      </div>
      <div className="flex-1 min-h-0">
        <Teams />
      </div>
    </div>
  );
};
