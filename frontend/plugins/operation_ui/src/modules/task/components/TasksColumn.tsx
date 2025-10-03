/* eslint-disable react-hooks/rules-of-hooks */
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import {
  IconAlertSquareRounded,
  IconClipboard,
  IconCalendarFilled,
  IconHash,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
  IconUsersGroup,
  IconRestore,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';
import { ITask } from '@/task/types';
import { useState } from 'react';
import { ITeam } from '@/team/types';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import clsx from 'clsx';
import { SelectTaskPriority } from '@/task/components/task-selects/SelectTaskPriority';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTeamTask } from '@/task/components/task-selects/SelectTeamTask';
import { taskDetailSheetState } from '@/task/states/taskDetailSheetState';
import { useSetAtom } from 'jotai';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';

export const tasksColumns = (
  _teams: ITeam[] | undefined,
  _team: ITeam | undefined,
): ColumnDef<ITask>[] => {
  const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<ITask>;

  return [
    checkBoxColumn,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead label="Name" icon={IconLabelFilled} />
      ),
      cell: ({ cell }) => {
        const name = cell.getValue() as string;
        const [value, setValue] = useState(name);
        const { updateTask } = useUpdateTask();
        const setActiveTask = useSetAtom(taskDetailSheetState);

        const handleUpdate = () => {
          if (value !== name) {
            updateTask({
              variables: { _id: cell.row.original._id, name: value },
            });
          }
        };

        return (
          <PopoverScoped
            closeOnEnter
            onOpenChange={(open) => {
              if (!open) {
                handleUpdate();
              }
            }}
            scope={clsx(
              TaskHotKeyScope.TaskTableCell,
              cell.row.original._id,
              'Name',
            )}
          >
            <RecordTableInlineCell.Trigger>
              <RecordTableInlineCell.Anchor
                onClick={() => setActiveTask(cell.row.original._id)}
              >
                {name}
              </RecordTableInlineCell.Anchor>
            </RecordTableInlineCell.Trigger>
            <RecordTableInlineCell.Content className="min-w-72">
              <Input
                value={value || ''}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUpdate();
                  }
                }}
              />
            </RecordTableInlineCell.Content>
          </PopoverScoped>
        );
      },
      size: 240,
    },

    {
      id: 'status',
      accessorKey: 'status',
      header: () => (
        <RecordTable.InlineHead label="Status" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        return (
          <SelectStatusTask
            variant="table"
            teamId={cell.row.original.teamId}
            value={cell.row.original.status || '0'}
            id={cell.row.original._id}
          />
        );
      },
      size: 170,
    },

    {
      id: 'assigneeId',
      header: () => <RecordTable.InlineHead label="Assignee" icon={IconUser} />,
      cell: ({ cell }) => {
        return (
          <SelectAssigneeTask
            variant="table"
            id={cell.row.original._id}
            value={cell.row.original.assigneeId}
            teamIds={[cell.row.original.teamId]}
            scope={clsx(
              TaskHotKeyScope.TaskTableCell,
              cell.row.original._id,
              'Assignee',
            )}
          />
        );
      },
      size: 240,
    },
    {
      id: 'priority',
      accessorKey: 'priority',
      header: () => (
        <RecordTable.InlineHead
          label="Priority"
          icon={IconAlertSquareRounded}
        />
      ),
      cell: ({ cell }) => {
        return (
          <SelectTaskPriority
            taskId={cell.row.original._id}
            value={cell.row.original.priority}
            variant="table"
          />
        );
      },
      size: 170,
    },
    {
      id: 'estimatePoint',
      accessorKey: 'estimatePoint',
      header: () => (
        <RecordTable.InlineHead label="Estimate Point" icon={IconHash} />
      ),
      cell: ({ cell }) => {
        const { _id, estimatePoint, teamId } = cell.row.original;
        return (
          <SelectEstimatedPoint
            taskId={_id}
            value={estimatePoint || 0}
            teamId={teamId}
            variant="table"
          />
        );
      },
      size: 240,
    },
    {
      id: 'cycleId',
      accessorKey: 'cycleId',
      header: () => <RecordTable.InlineHead label="Cycle" icon={IconRestore} />,
      cell: ({ cell }) => {
        return (
          <SelectCycle
            taskId={cell.row.original._id}
            value={cell.row.original.cycleId || ''}
            teamId={cell.row.original.teamId}
            variant="table"
          />
        );
      },
      size: 240,
    },
    {
      id: 'project',
      accessorKey: 'project',
      header: () => (
        <RecordTable.InlineHead label="Project" icon={IconClipboard} />
      ),
      cell: ({ cell }) => {
        return (
          <SelectProject
            value={cell.row.original.projectId || ''}
            taskId={cell.row.original._id}
            teamId={cell.row.original.teamId}
            variant="table"
          />
        );
      },
      size: 240,
    },

    {
      id: 'teamId',
      header: () => (
        <RecordTable.InlineHead label="Team" icon={IconUsersGroup} />
      ),
      cell: ({ cell }) => {
        return (
          <SelectTeamTask
            taskId={cell.row.original._id}
            value={cell.row.original.teamId || ''}
            variant="table"
          />
        );
      },
      size: 240,
    },
    {
      id: 'startDate',
      accessorKey: 'startDate',
      header: () => (
        <RecordTable.InlineHead label="Start Date" icon={IconCalendarFilled} />
      ),
      cell: ({ cell }) => {
        const startDate = cell.getValue() as string;
        return (
          <DateSelectTask
            type="startDate"
            value={startDate}
            id={cell.row.original._id}
          />
        );
      },
      size: 240,
    },
    {
      id: 'targetDate',
      accessorKey: 'targetDate',
      header: () => (
        <RecordTable.InlineHead label="Target Date" icon={IconCalendarFilled} />
      ),
      cell: ({ cell }) => {
        const targetDate = cell.getValue() as string;
        return (
          <DateSelectTask
            type="targetDate"
            value={targetDate}
            id={cell.row.original._id}
          />
        );
      },
      size: 240,
    },
  ];
};
