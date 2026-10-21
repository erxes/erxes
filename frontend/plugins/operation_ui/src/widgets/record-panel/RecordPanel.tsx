import { ActivityList } from '@/activity/components/ActivityList';
import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { isRecord } from '@/operation/utils/isRecord';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useTaskCustomFieldEdit } from '@/task/hooks/useTaskCustomFieldEdit';
import { ScrollArea, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IRecordPanelProps } from 'ui-modules';
import { TaskPanelActions } from './TaskPanelActions';
import { TaskPanelDetail } from './TaskPanelDetail';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { TriagePanelActions } from './TriagePanelActions';
import { TriagePanelDetail } from './TriagePanelDetail';
import { TaskPanelNew } from './TaskPanelNew';
import { TriagePanelNew } from './TriagePanelNew';

const TaskPanelTitle = ({ taskId }: { taskId: string }) => {
  const { t } = useTranslation('operation');
  const { task, loading } = useGetTask(taskId);

  if (loading && !task) {
    return <Skeleton className="h-4 w-32" />;
  }

  return task?.name || t('untitled', 'Untitled');
};

const TaskPanelProperties = ({ taskId }: { taskId: string }) => {
  const { task } = useGetTask(taskId);

  return (
    <ScrollArea className="flex-1 min-h-0">
      <PropertiesSidePanel
        contentType={TASK_CONTENT_TYPE}
        contentId={taskId}
        propertiesData={
          isRecord(task?.propertiesData) ? task.propertiesData : undefined
        }
        mutateHook={useTaskCustomFieldEdit}
      />
    </ScrollArea>
  );
};

const TriagePanelTitle = ({ triageId }: { triageId: string }) => {
  const { t } = useTranslation('operation');
  const { triage, loading } = useGetTriage(triageId);

  if (loading && !triage) {
    return <Skeleton className="h-4 w-32" />;
  }

  return triage?.name || t('untitled', 'Untitled');
};

const TriagePanelActivity = ({ triageId }: { triageId: string }) => {
  const { triage } = useGetTriage(triageId);

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        {triage && <ActivityList contentId={triageId} contentDetail={triage} />}
      </div>
    </ScrollArea>
  );
};

// A triage, until it is accepted as a task (it has no properties).
const TriagePanel = ({
  triageId,
  view,
}: {
  triageId: string;
  view: IRecordPanelProps['view'];
}) => {
  if (view === 'new') {
    return <TriagePanelNew />;
  }

  if (view === 'title') {
    return <TriagePanelTitle triageId={triageId} />;
  }

  if (view === 'actions') {
    return <TriagePanelActions triageId={triageId} />;
  }

  if (view === 'activity') {
    return <TriagePanelActivity triageId={triageId} />;
  }

  if (view === 'properties') {
    return null;
  }

  return <TriagePanelDetail triageId={triageId} />;
};

// Operation keeps a task's activity and comments itself.
const TaskPanelActivity = ({ taskId }: { taskId: string }) => {
  const { task } = useGetTask(taskId);

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="p-3">
        {task && <ActivityList contentId={taskId} contentDetail={task} />}
      </div>
    </ScrollArea>
  );
};

// Operation records drawn in the app's side panel (`widgets.recordPanels`).
export const RecordPanel = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps) => {
  if (contentType === TRIAGE_CONTENT_TYPE) {
    return <TriagePanel triageId={contentId} view={view} />;
  }

  if (contentType !== TASK_CONTENT_TYPE) {
    return null;
  }

  if (view === 'new') {
    return <TaskPanelNew />;
  }

  if (view === 'title') {
    return <TaskPanelTitle taskId={contentId} />;
  }

  if (view === 'actions') {
    return <TaskPanelActions taskId={contentId} />;
  }

  if (view === 'properties') {
    return <TaskPanelProperties taskId={contentId} />;
  }

  if (view === 'activity') {
    return <TaskPanelActivity taskId={contentId} />;
  }

  return <TaskPanelDetail taskId={contentId} />;
};

export default RecordPanel;
