import type { NotificationTaskDetailProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { isRecord } from '@/operation/utils/isRecord';
import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { FocusSheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TaskSideWidgets } from '~/widgets/relation/TaskSideWidgets';
import { NotificationOpenButton } from '~/widgets/notifications/my-inbox/components/NotificationOpenButton';
import { useScrollViewportHeight } from '~/widgets/notifications/my-inbox/hooks/useScrollViewportHeight';

export const NotificationTaskDetail = ({
  contentTypeId,
}: NotificationTaskDetailProps) => {
  const { t } = useTranslation('operation');
  const { task, loading: loadingTask } = useGetTask(contentTypeId);
  const { triage } = useGetTriage(contentTypeId, {
    skip: loadingTask || !!task,
  });
  const { ref, height } = useScrollViewportHeight();
  const sideContentId = task?._id ?? triage?._id;
  let openTo: string | undefined;
  if (task) {
    openTo = `/operation/tasks/${task._id}`;
  } else if (triage?.teamId) {
    openTo = `/operation/team/${triage.teamId}/triage/${triage._id}`;
  }

  return (
    <div ref={ref} className="flex w-full lg:min-h-full">
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full p-6 xl:max-w-3xl">
          <TaskDetails
            taskId={contentTypeId}
            checkTriage={true}
            titleAction={
              openTo && (
                <NotificationOpenButton to={openTo}>
                  {task
                    ? t('open-task', 'Open task')
                    : t('open-triage', 'Open triage')}
                </NotificationOpenButton>
              )
            }
          />
        </div>
      </div>
      {sideContentId && !!height && (
        <div
          className="sticky top-0 flex shrink-0 self-start"
          style={{ height }}
        >
          <FocusSheet>
            <TaskSideWidgets
              contentId={sideContentId}
              customerId={task?.customerId}
              companyId={task?.companyId}
              propertiesData={
                task?.propertiesData && isRecord(task.propertiesData)
                  ? task.propertiesData
                  : undefined
              }
            />
          </FocusSheet>
        </div>
      )}
    </div>
  );
};
