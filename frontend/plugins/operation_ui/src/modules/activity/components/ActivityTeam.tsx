import { IActivity } from '@/activity/types';
import { useGetTeams } from '@/team/hooks/useGetTeams';
import { Badge, IconComponent, TextOverflowTooltip } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

export const ActivityTeam = ({
  metadata,
}: {
  metadata: IActivity['metadata'];
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { teams } = useGetTeams({
    variables: {
      userId: currentUser?._id,
    },
  });
  const renderTeamValue = (teamIds: string[]) => {
    if (!teams) return null;
    const selectedTeams = teams?.filter((team) => teamIds.includes(team._id));
    const teamNames = selectedTeams.map((team) => team.name).join(', ');
    if (selectedTeams.length === 0)
      return <span className="text-accent-foreground text-sm">{'Team'}</span>;

    return (
      <div className="flex items-center gap-2 max-w-[200px]">
        <TextOverflowTooltip
          className="text-base font-medium"
          value={teamNames}
        />
      </div>
    );
  };

  const { previousValue, newValue } = metadata;

  const previousTeam = teams?.find((team) => team._id === previousValue);
  const newTeam = teams?.find((team) => team._id === newValue);

  return (
    <div className="inline-flex items-center gap-1">
      changed team to
      <Badge variant="secondary" className="flex-none">
        <IconComponent name={newTeam?.icon} className="size-4" />
        {renderTeamValue([newValue])}
      </Badge>
      from
      <Badge variant="secondary" className="flex-none">
        <IconComponent name={previousTeam?.icon} className="size-4" />
        {previousValue && renderTeamValue([previousValue])}
      </Badge>
    </div>
  );
};
