import { Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useGetTask } from '@/task/hooks/useGetTask';
import { FavoriteToggleIconButton, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const TaskDetailBreadCrump = () => {
  const { teamId, taskId } = useParams<{
    teamId?: string;
    taskId: string;
  }>();
  const { t } = useTranslation('operation');

  const { task, loading } = useGetTask({ variables: { _id: taskId } });

  if (loading) {
    return <Skeleton className="w-12 h-lh" />;
  }

  // Determine base path
  const basePath = teamId
    ? `/operation/team/${teamId}/tasks/${taskId}`
    : `/operation/tasks/${taskId}`;
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('tasks'), task?.name);

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
