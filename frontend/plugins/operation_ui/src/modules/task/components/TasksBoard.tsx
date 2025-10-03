import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import { useTasks } from '@/task/hooks/useGetTasks';
import { ITask } from '@/task/types';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  Board,
  BoardColumnProps,
  BoardItemProps,
  Button,
  EnumCursorDirection,
  Skeleton,
  SkeletonArray,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { currentUserState } from 'ui-modules';
import { TaskBoardCard } from '@/task/components/TaskBoardCard';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import clsx from 'clsx';
import { taskCountByBoardAtom } from '@/task/states/tasksTotalCountState';
import { IconPlus } from '@tabler/icons-react';
import {
  taskCreateDefaultValuesState,
  taskCreateSheetState,
} from '@/task/states/taskCreateSheetState';
import { useInView } from 'react-intersection-observer';
import { StatusInlineIcon } from '@/operation/components/StatusInline';

const fetchedTasksState = atom<BoardItemProps[]>([]);
export const allTasksMapState = atom<Record<string, ITask>>({});

export const TasksBoard = () => {
  const { teamId, cycleId } = useParams();
  const allTasksMap = useAtomValue(allTasksMapState);
  const { updateTask } = useUpdateTask();

  const { statuses } = useGetStatusByTeam({
    variables: {
      teamId: teamId || undefined,
    },
    skip: !teamId,
  });

  const columns = statuses?.map((status) => ({
    id: status.value,
    name: status.label,
    type: status.type,
    color: status.color,
  }));

  const [tasks, setTasks] = useAtom(fetchedTasksState);
  const setTaskCountByBoard = useSetAtom(taskCountByBoardAtom);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeItem = allTasksMap[active.id as string];
    const overItem = allTasksMap[over.id as string];
    const overColumn =
      overItem?.status ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;

    if (activeItem?.status === overColumn) {
      return;
    }
    updateTask({
      variables: {
        _id: activeItem?._id,
        status: overColumn,
      },
    });
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === activeItem?._id) {
          return {
            ...task,
            column: overColumn,
            sort: new Date().toISOString(),
          };
        }
        return task;
      }),
    );
    setTaskCountByBoard((prev) => ({
      ...prev,
      [activeItem?.status]: prev[activeItem?.status] - 1 || 0,
      [overColumn]: (prev[overColumn] || 0) + 1,
    }));
  };

  return (
    <Board.Provider
      columns={columns}
      data={tasks}
      onDragEnd={handleDragEnd}
      boardId={clsx('tasks-board', teamId)}
    >
      {(column) => (
        <Board id={column.id} key={column.id} sortBy="updated">
          <TasksBoardCards column={column} />
        </Board>
      )}
    </Board.Provider>
  );
};

export const TasksBoardCards = ({ column }: { column: BoardColumnProps }) => {
  const currentUser = useAtomValue(currentUserState);
  const { projectId, cycleId } = useParams();
  const [taskCards, setTaskCards] = useAtom(fetchedTasksState);
  const [taskCountByBoard, setTaskCountByBoard] = useAtom(taskCountByBoardAtom);

  const boardCards = taskCards
    .filter((task) => task.column === column.id)
    .sort((a, b) => {
      if (a.sort && b.sort) {
        return b.sort.toString().localeCompare(a.sort.toString());
      }
      return 0;
    });
  const { tasks, totalCount, loading, handleFetchMore } = useTasks({
    variables: {
      projectId,
      userId: currentUser?._id,
      cycleId,
      status: column.id,
    },
  });
  const setAllTasksMap = useSetAtom(allTasksMapState);

  useEffect(() => {
    if (tasks) {
      setTaskCards((prev) => {
        const previousTasks = prev.filter(
          (task) => !tasks.some((t) => t._id === task.id),
        );
        return [
          ...previousTasks,
          ...tasks.map((task) => ({
            id: task._id,
            column: task.status,
            sort: task.updatedAt,
          })),
        ];
      });
      setAllTasksMap((prev) => {
        const newTasks = tasks.reduce((acc, task) => {
          acc[task._id] = task;
          return acc;
        }, {} as Record<string, ITask>);
        return { ...prev, ...newTasks };
      });
    }
  }, [tasks, setTaskCards, setAllTasksMap, column.id]);

  useEffect(() => {
    if (totalCount) {
      setTaskCountByBoard((prev) => ({
        ...prev,
        [column.id]: totalCount || 0,
      }));
    }
  }, [totalCount, setTaskCountByBoard, column.id]);

  return (
    <>
      <Board.Header>
        <h4 className="capitalize flex items-center gap-1 pl-1">
          <StatusInlineIcon statusType={column.type as number} />
          {column.name}
          <span className="text-accent-foreground font-medium pl-1">
            {loading ? (
              <Skeleton className="size-4 rounded" />
            ) : (
              taskCountByBoard[column.id] || 0
            )}
          </span>
        </h4>
        <TaskCreateSheetTrigger status={column.id} />
      </Board.Header>
      <Board.Cards id={column.id} items={boardCards.map((task) => task.id)}>
        {loading ? (
          <SkeletonArray
            className="p-24 w-full rounded shadow-xs opacity-80"
            count={10}
          />
        ) : (
          boardCards.map((task) => (
            <Board.Card
              key={task.id}
              id={task.id}
              name={task.name}
              column={column.id}
            >
              <TaskBoardCard id={task.id} column={column.id} />
            </Board.Card>
          ))
        )}
        <TaskCardsFetchMore
          totalCount={taskCountByBoard[column.id] || 0}
          currentLength={boardCards.length}
          handleFetchMore={() =>
            handleFetchMore({ direction: EnumCursorDirection.FORWARD })
          }
        />
      </Board.Cards>
    </>
  );
};

export const TaskCardsFetchMore = ({
  totalCount,
  handleFetchMore,
  currentLength,
}: {
  totalCount: number;
  handleFetchMore: () => void;
  currentLength: number;
}) => {
  const { ref: bottomRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  if (!totalCount || currentLength >= totalCount || currentLength === 0) {
    return null;
  }

  return (
    <div ref={bottomRef}>
      <Skeleton className="p-12 w-full rounded shadow-xs opacity-80" />
    </div>
  );
};

const TaskCreateSheetTrigger = ({ status }: { status: string }) => {
  const setOpenCreateTask = useSetAtom(taskCreateSheetState);
  const setDefaultValues = useSetAtom(taskCreateDefaultValuesState);

  const handleClick = () => {
    setDefaultValues({ status });
    setOpenCreateTask(true);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleClick}>
      <IconPlus />
    </Button>
  );
};
