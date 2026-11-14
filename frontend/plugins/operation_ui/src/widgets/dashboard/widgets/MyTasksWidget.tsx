import { compactList } from '@/operation/utils/cursorList';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { useRefetchOnTaskListChange } from '@/task/hooks/useRefetchOnTaskListChange';
import { useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { DashboardWidgetCard, currentUserState } from 'ui-modules';
import { OperationDashboardBody } from '~/widgets/dashboard/components/OperationDashboardBody';
import { OperationDashboardOpenLink } from '~/widgets/dashboard/components/OperationDashboardOpenLink';
import { MY_TASKS_DASHBOARD_LIMIT } from '~/widgets/dashboard/operationDashboardConfig';
import { TaskItemRow } from '~/widgets/rows/TaskRow';

/**
 * The signed-in user's assigned tasks, in progress first (the API's status
 * order), as on the My tasks page.
 */
export const MyTasksWidget = () => {
  const { t } = useTranslation('operation');
  const currentUser = useAtomValue(currentUserState);
  const userId = currentUser?._id;
  const filter = { userId, limit: MY_TASKS_DASHBOARD_LIMIT };

  const { data, loading, error, refetch } = useQuery(GET_TASKS, {
    variables: { filter },
    skip: !userId,
  });

  useRefetchOnTaskListChange({ filter, skip: !userId, refetch });

  const tasks = compactList(data?.getTasks?.list);
  const totalCount = data?.getTasks?.totalCount ?? 0;

  return (
    <DashboardWidgetCard
      title={
        totalCount
          ? t('dashboard.my-tasks-count', { count: totalCount })
          : t('my-tasks')
      }
      action={<OperationDashboardOpenLink to="/operation/tasks" />}
    >
      <OperationDashboardBody
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!tasks.length}
        emptyLabel={t('dashboard.no-my-tasks')}
      >
        <div className="flex flex-col">
          {tasks.map((task) => (
            <TaskItemRow key={task._id} task={task} />
          ))}
        </div>
      </OperationDashboardBody>
    </DashboardWidgetCard>
  );
};
