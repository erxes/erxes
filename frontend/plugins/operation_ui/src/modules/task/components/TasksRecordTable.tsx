import { tasksColumns } from '@/task/components/TasksColumn';
import { isUndefinedOrNull, RecordTable } from 'erxes-ui';
import { useTasks } from '@/task/hooks/useGetTasks';
import { TASKS_CURSOR_SESSION_KEY } from '@/task/constants';
import { useGetTeams } from '@/team/hooks/useGetTeams';
import { useAtomValue, useSetAtom } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { taskTotalCountAtom } from '@/task/states/tasksTotalCountState';

export const TasksRecordTable = () => {
  const { projectId, cycleId, teamId } = useParams();
  const currentUser = useAtomValue(currentUserState);
  const setTaskTotalCount = useSetAtom(taskTotalCountAtom);

  const variables = {
    projectId: projectId || undefined,
    cycleId: cycleId || undefined,
    userId: currentUser?._id,
  };

  const { tasks, handleFetchMore, pageInfo, loading, totalCount } = useTasks({
    variables,
  });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTaskTotalCount(totalCount);
  }, [totalCount, setTaskTotalCount]);

  const { teams } = useGetTeams({
    variables: {
      userId: currentUser?._id,
    },
  });

  const team = teams?.find((team) => team._id === teamId);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <RecordTable.Provider
        columns={tasksColumns(teams, team)}
        data={tasks || (loading ? [{}] : [])}
        className="m-3 h-full"
        stickyColumns={['checkbox', 'name']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={tasks?.length}
          sessionKey={TASKS_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
