import { TaskDetailActions } from '@/task/components/task-actions/TaskDetailActions';
import { useGetTask } from '@/task/hooks/useGetTask';
import { IconBrandGithub } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { CopyTaskUrlButton } from '@/task/components/task-actions/CopyTask';

// A task's actions in the side panel's top bar.
export const TaskPanelActions = ({ taskId }: { taskId: string }) => {
  const { task } = useGetTask(taskId);

  if (!task) {
    return null;
  }

  const { githubIssueNumber, githubIssueUrl, githubRepoName } = task;

  return (
    <>
      {githubIssueNumber && githubIssueUrl && (
        <Button asChild variant="ghost" size="icon" className="size-7">
          <a
            href={githubIssueUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`${
              githubRepoName ? `${githubRepoName} ` : ''
            }#${githubIssueNumber}`}
          >
            <IconBrandGithub className="size-4" />
          </a>
        </Button>
      )}
      <CopyTaskUrlButton task={task} />
      <TaskDetailActions taskId={task._id} />
    </>
  );
};
