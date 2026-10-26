import { TASK_DETAIL_QUERY_KEY } from '@/task/constants';
import { useTaskDetailSheet } from '@/task/hooks/useTaskDetailSheet';
import { useQueryState } from 'erxes-ui';
import { useEffect } from 'react';

// Opens an old `?task_id=` link in the side panel, where tasks now open.
export const TaskDetailLink = () => {
  const [linkedTask, setLinkedTask] = useQueryState<string>(
    TASK_DETAIL_QUERY_KEY,
  );
  const [, setActiveTask] = useTaskDetailSheet();

  useEffect(() => {
    if (!linkedTask) {
      return;
    }

    setLinkedTask(null);
    setActiveTask(linkedTask);
  }, [linkedTask, setLinkedTask, setActiveTask]);

  return null;
};
