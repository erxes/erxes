import { useGetTask } from '@/task/hooks/useGetTask';
import { useTaskDetailSheet } from '@/task/hooks/useTaskDetailSheet';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { ITriageDetail } from '@/triage/types/triage';
import { format } from 'date-fns';
import { Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ContactWidgetRow, useSidePanel } from 'ui-modules';

// A triage as one line; opens it stacked in the side panel.
export const TriageRow = ({
  triage,
}: {
  triage: Pick<ITriageDetail, '_id' | 'name'>;
}) => {
  const { t } = useTranslation('operation');
  const { openRecord } = useSidePanel();

  return (
    <ContactWidgetRow
      title={triage.name || t('untitled', 'Untitled')}
      meta={t('triage', 'Triage')}
      onClick={() =>
        openRecord(
          { contentType: TRIAGE_CONTENT_TYPE, contentId: triage._id },
          { stack: true },
        )
      }
    />
  );
};

/**
 * A task as one compact line (name, due date) wherever tasks are
 * listed for another record; opens it stacked in the side panel. An id that
 * is a triage, not yet a task, shows that triage instead (an accepted
 * triage's task keeps its id).
 */
// A task already loaded, as one line; opens it stacked in the side panel.
export const TaskItemRow = ({
  task,
}: {
  task: { _id: string; name?: string | null; targetDate?: string | null };
}) => {
  const { t } = useTranslation('operation');
  const [, setActiveTask] = useTaskDetailSheet();

  return (
    <ContactWidgetRow
      title={task.name || t('untitled', 'Untitled')}
      meta={task.targetDate && format(new Date(task.targetDate), 'MMM d')}
      onClick={() => setActiveTask(task._id, { stack: true })}
    />
  );
};

export const TaskRow = ({ taskId }: { taskId: string }) => {
  const { task, loading } = useGetTask(taskId);
  const { triage, loading: loadingTriage } = useGetTriage(taskId, {
    skip: !!task?._id || loading,
  });

  if ((loading && !task) || loadingTriage) {
    return <Skeleton className="mx-2 my-1.5 h-5" />;
  }

  if (!task) {
    return triage ? <TriageRow triage={triage} /> : null;
  }

  return <TaskItemRow task={task} />;
};
