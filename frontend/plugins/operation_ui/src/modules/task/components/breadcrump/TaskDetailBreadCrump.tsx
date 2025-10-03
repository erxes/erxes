import { Breadcrumb, Button, Skeleton } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { useGetTask } from '@/task/hooks/useGetTask';

export const TaskDetailBreadCrump = () => {
  const { teamId, taskId } = useParams<{
    teamId?: string;
    taskId: string;
  }>();

  const { task, loading } = useGetTask({ variables: { _id: taskId } });

  if (loading) {
    return <Skeleton className="w-12 h-[1lh]" />;
  }

  // Determine base path
  const basePath = teamId
    ? `/operation/team/${teamId}/tasks/${taskId}`
    : `/operation/tasks/${taskId}`;

  return (
    <Breadcrumb>
      <Breadcrumb.List className="gap-1">
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={`${basePath}`}>{task?.name}</Link>
          </Button>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb>
  );
};
