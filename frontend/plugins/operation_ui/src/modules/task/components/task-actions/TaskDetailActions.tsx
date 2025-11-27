import { Button, Command, Popover } from 'erxes-ui';
import { useState } from 'react';
import {
  TasksSetDueDateCommandBarItem,
  TasksSetDueDateTrigger,
} from './SetDueDate';
import { IconDotsVertical } from '@tabler/icons-react';
import {
  TasksMoveToTeamCommandBarItem,
  TasksMoveToTeamTrigger,
} from './MoveToTeam';
import { MakeACopyTrigger } from './MakeACopy';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useParams } from 'react-router-dom';

export const TaskDetailActions = ({ taskId }: { taskId: string }) => {
  const [open, setOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<string>('main');
  const { task } = useGetTask({ variables: { _id: taskId } });
  const { teamId } = useParams();
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
      </Popover.Content>
    </Popover>
  );
};
