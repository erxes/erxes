import { useTranslation } from 'react-i18next';
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
  Spinner,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { currentUserState } from 'ui-modules';
import { TaskBoardCard } from '@/task/components/TaskBoardCard';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import clsx from 'clsx';
import { taskCountByBoardAtom } from '@/task/states/tasksTotalCountState';
import { IconBrandTrello, IconPlus, IconSettings } from '@tabler/icons-react';
import {
  taskCreateDefaultValuesState,
  taskCreateSheetState,
} from '@/task/states/taskCreateSheetState';
import { useInView } from 'react-intersection-observer';
import { StatusInlineIcon } from '@/operation/components/StatusInline';

type TaskBoardItem = BoardItemProps & { task: ITask };

const fetchedTasksState = atom<TaskBoardItem[]>([]);

export function TasksBoard() {
  const { t } = useTranslation('operation');
  const { teamId } = useParams();
  const { updateTask } = useUpdateTask();
  const [tasks, setTasks] = useAtom(fetchedTasksState);
  const setTaskCountByBoard = useSetAtom(taskCountByBoardAtom);

  useEffect(() => {
    return () => {
      setTasks([]);
      setTaskCountByBoard({});
    };
  }, [teamId, setTaskCountByBoard, setTasks]);

  const { statuses, loading } = useGetStatusByTeam({
    variables: teamId ? { teamId } : undefined,
    skip: !teamId,
  });

  const columns = statuses?.map((status) => ({
    id: status.value,
    name: status.label,
    type: status.type.toString(),
    color: status.color,
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeItem = tasks.find((task) => task.id === active.id)?.task;
    if (!activeItem) {
      return;
    }
    const overItem = tasks.find((task) => task.id === over.id)?.task;
    const overColumn =
      overItem?.status ||
      columns?.find((col) => col.id === over.id)?.id ||
      columns?.[0]?.id;

    if (!overColumn || activeItem.status === overColumn) {
      return;
    }
    updateTask({
      variables: {
        _id: activeItem._id,
        status: overColumn,
      },
    });
    const newSort = new Date().toISOString();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === activeItem._id) {
          return {
            ...task,
            column: overColumn,
            sort: newSort,
          };
        }
        return task;
      }),
    );

    setTaskCountByBoard((prev) => ({
      ...prev,
      [activeItem.status]: Math.max((prev[activeItem.status] || 0) - 1, 0),
      [overColumn]: (prev[overColumn] || 0) + 1,
    }));
  };
  if (loading) return <Spinner />;
  return (
    <Board.Provider
      columns={columns}
      data={tasks}
      onDragEnd={handleDragEnd}
      boardId={clsx('tasks-board', teamId)}
      fallbackComponent={
        <div className="flex h-full w-full flex-col items-center justify-center text-center p-6 gap-2">
          <IconBrandTrello
            size={64}
            stroke={1.5}
            className="text-muted-foreground"
          />
          <h2 className="text-lg font-semibold text-muted-foreground">
            {t('no-team-yet')}
          </h2>
          <p className="text-md text-muted-foreground mb-4">
            {t('create-team-to-start')}
          </p>
          <Button variant="outline" asChild>
            <Link to="/settings/operation/team">
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
        </div>
      }
    >
      {(column) => (
        <Board id={column.id} key={column.id} sortBy="updated">
          <TasksBoardCards column={column} />
        </Board>
      )}
    </Board.Provider>
  );
}

export function TasksBoardCards({
  column,
}: Readonly<{ column: BoardColumnProps }>) {
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
      ...(projectId && { projectId }),
      ...(cycleId && { cycleId }),
      userId: currentUser?._id,
      status: column.id,
    },
  });
  const isInitialLoading = loading && !tasks;

  useEffect(() => {
    if (!tasks) return;
    setTaskCards((prev) => {
      const prevById = new Map(prev.map((task) => [task.id, task]));
      return [
        ...prev.filter(
          (task) =>
            task.column !== column.id && !tasks.some((t) => t._id === task.id),
        ),
        ...tasks.map((task) => ({
          id: task._id,
          column: task.status,
          sort: prevById.get(task._id)?.sort ?? task.updatedAt,
          task,
        })),
      ];
    });
  }, [tasks, setTaskCards, column.id]);

  useEffect(() => {
    if (typeof totalCount === 'number') {
      setTaskCountByBoard((prev) => ({
        ...prev,
        [column.id]: totalCount,
      }));
    }
  }, [totalCount, setTaskCountByBoard, column.id]);

  return (
    <>
      <Board.Header>
        <h4 className="capitalize flex items-center gap-1 pl-1">
          <StatusInlineIcon statusType={column.type} />
          {column.name}
          <span className="text-accent-foreground font-medium pl-1">
            {isInitialLoading ? (
              <Skeleton className="size-4 rounded" />
            ) : (
              taskCountByBoard[column.id] || 0
            )}
          </span>
        </h4>
        <TaskCreateSheetTrigger status={column.id} />
      </Board.Header>
      <Board.Cards id={column.id} items={boardCards.map((task) => task.id)}>
        {isInitialLoading ? (
          <SkeletonArray
            className="p-24 w-full rounded shadow-xs opacity-80"
            count={10}
          />
        ) : (
          boardCards.map((task) => (
            <Board.Card
              key={task.id}
              id={task.id}
              name={task.task.name}
              column={column.id}
            >
              <TaskBoardCard task={task.task} column={column.id} />
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
}

export function TaskCardsFetchMore({
  totalCount,
  handleFetchMore,
  currentLength,
}: Readonly<{
  totalCount: number;
  handleFetchMore: () => void;
  currentLength: number;
}>) {
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
}

function TaskCreateSheetTrigger({ status }: Readonly<{ status: string }>) {
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
}
