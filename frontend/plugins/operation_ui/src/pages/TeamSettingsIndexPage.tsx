import { Teams } from '@/team/components/team-list/Teams';
import { CreateTeam } from '@/team/components/team-list/CreateTeam';

export const TeamsSettingsPage = () => {
  return (
    <div className="h-screen">
      <div className="ml-auto flex justify-between px-8 py-6">
        <h1 className="text-xlfont-semibold">Teams</h1>
        <CreateTeam />
      </div>
      <Teams />
    </div>
  );
};
