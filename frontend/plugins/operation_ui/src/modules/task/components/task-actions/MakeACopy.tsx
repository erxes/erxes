import { compactList } from '@/operation/utils/cursorList';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useCreateTaskRecord } from '@/task/hooks/useCreateTaskRecord';
import { ITask } from '@/task/types';
import { IconCopy } from '@tabler/icons-react';
import { Command, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type MakeACopyTriggerProps = {
  setOpen: (open: boolean) => void;
} & ({ taskId: string; task?: never } | { task: ITask; taskId?: never });

const useMakeACopy = () => {
  const { createTaskRecord } = useCreateTaskRecord();

  // The copy is created right away and opens in the side panel.
  const makeACopy = (task: ITask) => {
    createTaskRecord({
      name: `${task.name} (Copy)`,
      teamId: task.teamId || undefined,
      assigneeId: task.assigneeId || undefined,
      projectId: task.projectId || undefined,
      cycleId: task.cycleId || undefined,
      tagIds: compactList(task.tagIds),
      priority: task.priority || 0,
      status: task.status || undefined,
      estimatePoint: task.estimatePoint || 0,
      milestoneId: task.milestoneId || undefined,
      startDate: task.startDate ? new Date(task.startDate) : undefined,
      targetDate: task.targetDate ? new Date(task.targetDate) : undefined,
    });
  };

  return { makeACopy };
};

export const MakeACopyTrigger = ({
  taskId,
  task: taskProp,
  setOpen,
}: MakeACopyTriggerProps) => {
  const { t } = useTranslation('operation');
  const { task: fetchedTask, loading } = useGetTask(taskId);
  const task = taskProp || fetchedTask;
  const { makeACopy } = useMakeACopy();
  const { toast } = useToast();

  const handleMakeACopy = () => {
    if (!task) {
      toast({
        title: t('error'),
        description: t('task-not-found'),
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
      <div className="flex items-center">{t('make-a-copy')}</div>
    </Command.Item>
  );
};
