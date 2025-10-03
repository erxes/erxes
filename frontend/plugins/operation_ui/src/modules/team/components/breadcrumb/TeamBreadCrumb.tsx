import { Breadcrumb, Button, IconComponent, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';

export const TeamBreadCrumb = () => {
  const { teamId } = useParams();

  const { teams, loading } = useGetCurrentUsersTeams();

  const team = teams?.find((team) => team._id === teamId);

  if (loading) {
    return <Skeleton className="w-12 h-[1lh]" />;
  }

  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={`/operation/team/${teamId}`}>
          <IconComponent name={team?.icon} />
          {team?.name}
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
