import { Teams } from '@/team/components/team-list/Teams';

export const TeamsSettingsPage = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex-1 min-h-0">
        <Teams />
      </div>
    </div>
  );
};
