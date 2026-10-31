import type { NotificationTaskDetailProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { isRecord } from '@/operation/utils/isRecord';
import { TaskDetails } from '@/task/components/detail/TaskDetails';
import { useGetTask } from '@/task/hooks/useGetTask';
import { useGetTriage } from '@/triage/hooks/useGetTriage';
import { FocusSheet, ScrollArea } from 'erxes-ui';
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
    <div
      ref={ref}
      className="flex h-full min-h-0 w-full overflow-hidden"
      style={{ height }}
    >
      <ScrollArea className="min-w-0 flex-1" viewportClassName="[&>div]:block!">
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
      </ScrollArea>
      {sideContentId && !!height && (
        <div className="flex h-full shrink-0">
          <FocusSheet>
            <TaskSideWidgets
              contentId={sideContentId}
              customerId={task?.customerId ?? triage?.customerId}
              companyId={task?.companyId ?? triage?.companyId}
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
