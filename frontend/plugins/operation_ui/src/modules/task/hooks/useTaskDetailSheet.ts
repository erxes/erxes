import { TASK_CONTENT_TYPE } from '@/task/constants';
import { useCallback } from 'react';
import { IOpenRecordOptions, useSidePanel } from 'ui-modules';

/**
 * The task open in the app's side panel (`?panel=/detail/operation:task/<id>`)
 * and a setter opening one there, or closing it with `null`. Links, back and
 * forward work as the panel is part of the URL.
 */
export const useTaskDetailSheet = () => {
  const { record, openRecord, close } = useSidePanel();
  const activeTask =
    record?.contentType === TASK_CONTENT_TYPE ? record.contentId : null;

  const setActiveTask = useCallback(
    (taskId: string | null, options?: IOpenRecordOptions) => {
      if (taskId) {
        openRecord(
          { contentType: TASK_CONTENT_TYPE, contentId: taskId },
          options,
        );
        return;
      }

      if (activeTask) {
        close();
      }
    },
    [activeTask, openRecord, close],
  );

  return [activeTask, setActiveTask] as const;
};
