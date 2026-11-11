import { ActivityList } from '@/activity/components/ActivityList';
import { PropertiesSidePanel } from '@/operation/components/PropertiesSidePanel';
import { isRecord } from '@/operation/utils/isRecord';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useTaskCustomFieldEdit } from '@/task/hooks/useTaskCustomFieldEdit';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { ScrollArea, Skeleton, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { IRecordPanelProps } from 'ui-modules';
import { TaskPanelActions } from './TaskPanelActions';
import { TaskPanelDetail } from './TaskPanelDetail';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { TriagePanelActions } from './TriagePanelActions';
import { TriagePanelDetail } from './TriagePanelDetail';
import { TaskPanelNew } from './TaskPanelNew';
import { TriagePanelNew } from './TriagePanelNew';
import { TaskConnectionPanel } from '../contact/TaskConnectionPanel';
import { TASK_CONNECTION_CONTENT_TYPE } from '../contact/taskContactConnection';
import { PROJECT_CONTENT_TYPE } from '@/project/constants/contentType';
import { ProjectPanel } from './ProjectPanel';

const TITLE_FIELD_CLASS_NAME = 'rounded-sm px-1 font-medium shadow-none';

export const TaskPanelTitle = ({ taskId }: { taskId: string }) => {
  const { t } = useTranslation('operation');
  const { task, loading } = useGetTask(taskId);
  const { updateTask } = useUpdateTask();

  if (loading && !task) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (!task) {
    return t('untitled', 'Untitled');
  }

  return (
    <TextField
      scope={`side-panel-task.${taskId}.name`}
      value={task.name || ''}
      placeholder={t('task-name')}
      className={TITLE_FIELD_CLASS_NAME}
      onSave={(name) =>
        name.trim() && updateTask({ variables: { _id: taskId, name } })
      }
    />
  );
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
  const { updateTriage } = useUpdateTriage();

  if (loading && !triage) {
    return <Skeleton className="h-4 w-32" />;
  }

  if (!triage) {
    return t('untitled', 'Untitled');
  }

  return (
    <TextField
      scope={`side-panel-triage.${triageId}.name`}
      value={triage.name || ''}
      placeholder={t('triage-name')}
      className={TITLE_FIELD_CLASS_NAME}
      onSave={(name) =>
        name.trim() &&
        updateTriage({ variables: { _id: triageId, input: { name } } })
      }
    />
  );
};

const TriagePanelActivity = ({ triageId }: { triageId: string }) => {
  const { triage } = useGetTriage(triageId);

  return triage ? (
    <ActivityList
      key={triageId}
      contentId={triageId}
      contentDetail={triage}
      inPanel
    />
  ) : (
    <Skeleton className="m-4 h-20" />
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
export const TaskPanelActivity = ({ taskId }: { taskId: string }) => {
  const { task } = useGetTask(taskId);

  return task ? (
    <ActivityList
      key={taskId}
      contentId={taskId}
      contentDetail={task}
      inPanel
    />
  ) : (
    <Skeleton className="m-4 h-20" />
  );
};

// Operation records drawn in the app's side panel (`widgets.recordPanels`).
export const RecordPanel = ({
  contentType,
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('operation');

  if (contentType === TASK_CONNECTION_CONTENT_TYPE) {
    if (view === 'title') return t('connect-task', 'Connect task');
    return view === 'new' ? <TaskConnectionPanel /> : null;
  }

  if (contentType === TRIAGE_CONTENT_TYPE) {
    return <TriagePanel triageId={contentId} view={view} />;
  }

  if (contentType === PROJECT_CONTENT_TYPE) {
    return (
      <ProjectPanel
        contentType={contentType}
        contentId={contentId}
        view={view}
      />
    );
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
