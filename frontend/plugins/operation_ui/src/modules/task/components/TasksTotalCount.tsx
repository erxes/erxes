import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  taskTotalCountBoardAtom,
  taskTotalCountAtom,
} from '@/task/states/tasksTotalCountState';
import { tasksViewAtom } from '@/task/states/tasksViewState';
import { useParams } from 'react-router';

export const TasksTotalCount = () => {
  const { teamId } = useParams();
  const totalCount = useAtomValue(taskTotalCountAtom);
  const taskCountByBoard = useAtomValue(taskTotalCountBoardAtom);
  const view = useAtomValue(tasksViewAtom);

  const totalCountToShow =
    !teamId || view === 'list' ? totalCount : taskCountByBoard;

  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCountToShow) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCountToShow} records found`
      )}
    </div>
  );
};
