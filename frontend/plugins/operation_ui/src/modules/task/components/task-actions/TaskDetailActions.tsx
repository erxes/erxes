import { Button, Command, Popover, toast } from 'erxes-ui';
import { useState } from 'react';
import {
  TasksSetDueDateCommandBarItem,
  TasksSetDueDateTrigger,
} from './SetDueDate';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';
import {
  TasksMoveToTeamCommandBarItem,
  TasksMoveToTeamTrigger,
} from './MoveToTeam';
import { MakeACopyTrigger } from './MakeACopy';
import { CopyTaskTrigger, CopyTaskCommandBarItem } from './CopyTask';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useNavigate, useParams } from 'react-router-dom';
import { useRemoveTask } from '@/task/hooks/useRemoveTask';
import { useSetAtom } from 'jotai';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';

export const TaskDetailActions = ({ taskId }: { taskId: string }) => {
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('main');
  const { task } = useGetTask({ variables: { _id: taskId } });
  const { teamId } = useParams();
  const { removeTask } = useRemoveTask();
  const navigate = useNavigate();
  const setActiveTask = useSetAtom(taskDetailSheetState);

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        setTimeout(() => {
          setCurrentContent('main');
        }, 100);
      }}
    >
      <Popover.Trigger asChild>
        <Button variant="ghost" size="icon">
          <IconDotsVertical className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        className="min-w-[280px] p-0"
        align="start"
        side="top"
        sideOffset={10}
      >
        {currentContent === 'main' && (
          <Command>
            <Command.Input></Command.Input>
            <Command.List className="p-0">
              <Command.Group className="p-1">
                <TasksSetDueDateTrigger setCurrentContent={setCurrentContent} />
                <TasksMoveToTeamTrigger setCurrentContent={setCurrentContent} />
                <MakeACopyTrigger taskId={taskId} setOpen={setOpen} />
                <CopyTaskTrigger setCurrentContent={setCurrentContent} />
              </Command.Group>
              <Command.Separator />
              <Command.Group>
                <Command.Item
                  className="text-destructive"
                  onSelect={async () => {
                    await removeTask(taskId, {
                      onCompleted: () => {
                        setOpen(false);
                        setActiveTask(null);
                        if (teamId) {
                          navigate(`/operation/team/${teamId}/tasks`);
                        } else {
                          navigate(`/operation/tasks`);
                        }
                        toast({
                          title: 'Success',
                          description: `Deleted ${task?.name}`,
                          variant: 'success',
                        });
                      },
                      onError: () => {
                        toast({
                          title: 'Error',
                          description: `Failed to delete ${task?.name}`,
                          variant: 'destructive',
                        });
                      },
                    });
                  }}
                >
                  <div className="flex gap-2 items-center">
                    <IconTrash className="size-4" />
                    Delete
                  </div>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        )}
        {currentContent === 'setTargetDate' && (
          <TasksSetDueDateCommandBarItem taskIds={[taskId]} setOpen={setOpen} />
        )}
        {currentContent === 'moveToTeam' && (
          <TasksMoveToTeamCommandBarItem
            tasks={
              task
                ? [{ taskId: task._id, projectId: task.projectId ?? null }]
                : []
            }
            setOpen={setOpen}
            currentTeamId={teamId || undefined}
          />
        )}
        {currentContent === 'copy' && task && (
          <CopyTaskCommandBarItem tasks={[task]} setOpen={setOpen} />
        )}
      </Popover.Content>
    </Popover>
  );
};
