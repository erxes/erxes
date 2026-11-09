import { ProgressBreakdownRow } from '@/operation/components/progress/ScopeProgress';
import { useGetProjectProgressByTeam } from '@/project/hooks/useGetProjectProgressByTeam';
import { IProjectProgressByTeam } from '@/project/types';
import { TeamInline } from '@/team/components/TeamInline';

export const ProgressByTeamList = ({
  items,
}: {
  items: IProjectProgressByTeam[];
}) => (
  <div>
    {items.map((item) => (
      <ProgressBreakdownRow
        key={item.teamId ?? 'unassigned'}
        item={item}
        ringClassName="ml-auto"
        label={item.teamId && <TeamInline teamId={item.teamId} />}
      />
    ))}
  </div>
);

export const ProgressByTeam = ({ projectId }: { projectId: string }) => {
  const { projectProgressByTeam } = useGetProjectProgressByTeam(projectId);

  if (!projectProgressByTeam) {
    return null;
  }

  return <ProgressByTeamList items={projectProgressByTeam} />;
};
