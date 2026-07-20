import { Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useGetTask } from '@/task/hooks/useGetTask';
import { FavoriteToggleIconButton } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useTeamFavoriteBreadcrumb } from '@/team/hooks/useTeamFavoriteBreadcrumb';

export const TaskDetailBreadCrump = () => {
  const { teamId, taskId } = useParams<{
    teamId?: string;
    taskId: string;
  }>();
  const { t } = useTranslation('operation');

  const { task, loading } = useGetTask({ variables: { _id: taskId } });

  // Determine base path
  const basePath = teamId
    ? `/operation/team/${teamId}/tasks/${taskId}`
    : `/operation/tasks/${taskId}`;
  const taskSegment = taskId ? task?.name || 'Unknown' : undefined;
  const { breadcrumb: favoriteBreadcrumb, loading: teamLoading } =
    useTeamFavoriteBreadcrumb(
      teamId,
      teamId ? taskSegment : t('tasks'),
      teamId ? undefined : taskSegment,
    );

  if (loading || teamLoading) {
    return <Skeleton className="w-12 h-lh" />;
  }

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={`${basePath}`}>{task?.name}</Link>
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item className="ml-1">
          <FavoriteToggleIconButton
            breadcrumb={favoriteBreadcrumb}
            icon="IconChecklist"
          />
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
