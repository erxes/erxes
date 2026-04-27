import { useGetTask } from '@/task/hooks/useGetTask';
import {
  taskCreateDefaultValuesState,
  taskCreateSheetState,
} from '@/task/states/taskCreateSheetState';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { ITask, TAddTask } from '@/task/types';
import { IconCopy } from '@tabler/icons-react';
import { Command, useToast } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useNavigate, useLocation } from 'react-router-dom';

type MakeACopyTriggerProps = {
  setOpen: (open: boolean) => void;
} & ({ taskId: string; task?: never } | { task: ITask; taskId?: never });

const useMakeACopy = () => {
  const setTaskCreateSheet = useSetAtom(taskCreateSheetState);
  const setTaskCreateDefaultValues = useSetAtom(taskCreateDefaultValuesState);
  const setTaskDetailSheet = useSetAtom(taskDetailSheetState);
  const navigate = useNavigate();
  const location = useLocation();

  const makeACopy = (task: ITask) => {
    const copiedTaskData: Partial<TAddTask> = {
      name: task.name ? `${task.name} (Copy)` : '',
      teamId: task.teamId || undefined,
      assigneeId: task.assigneeId || undefined,
      projectId: task.projectId || undefined,
      cycleId: task.cycleId || undefined,
      tagIds: task.tagIds || [],
      priority: task.priority || 0,
      status: task.status || undefined,
      estimatePoint: task.estimatePoint || 0,
      milestoneId: task.milestoneId || undefined,
      startDate: task.startDate ? new Date(task.startDate) : undefined,
      targetDate: task.targetDate ? new Date(task.targetDate) : undefined,
    };

    setTaskDetailSheet(null);
    setTaskCreateDefaultValues(copiedTaskData);

    const isFullscreenView = location.pathname.includes('/tasks/');
    if (isFullscreenView) {
      const basePath = location.pathname.split('/tasks/')[0];
      navigate(`${basePath}/tasks`);
      setTimeout(() => {
        setTaskCreateSheet(true);
      }, 100);
    } else {
      setTaskCreateSheet(true);
    }
  };

  return { makeACopy };
};

export const MakeACopyTrigger = ({
  taskId,
  task: taskProp,
  setOpen,
}: MakeACopyTriggerProps) => {
  const { task: fetchedTask, loading } = useGetTask({
    variables: { _id: taskId || '' },
    skip: !taskId,
  });
  const task = taskProp || fetchedTask;
  const { makeACopy } = useMakeACopy();
  const { toast } = useToast();

  const handleMakeACopy = () => {
    if (!task) {
      toast({
        title: 'Error',
        description: 'Task not found',
        variant: 'destructive',
      });
      return;
    }

    makeACopy(task);
    setOpen(false);
  };

  return (
    <Command.Item
      onSelect={handleMakeACopy}
      disabled={taskId ? loading || !task : !task}
    >
      <IconCopy className="size-4" />
      <div className="flex items-center">Make a copy</div>
    </Command.Item>
  );
};
