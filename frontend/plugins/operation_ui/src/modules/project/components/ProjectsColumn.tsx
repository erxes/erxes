/* eslint-disable react-hooks/rules-of-hooks */
import { useNavigate } from 'react-router-dom';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import {
  IconAlertSquareRounded,
  IconCalendarFilled,
  IconLabelFilled,
  IconProgressCheck,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Input,
  RecordTable,
  RecordTableInlineCell,
  PopoverScoped,
} from 'erxes-ui';
import { IProject } from '@/project/types';
import { useState } from 'react';
import { ProjectHotKeyScope } from '@/project/constants/ProjectHotKeyScope';
import { ITeam } from '@/team/types';
import {
  SelectLead,
  DateSelect,
  SelectProjectTeam,
} from '@/project/components/select';
import clsx from 'clsx';
import { SelectProjectPriority } from '@/project/components/select/SelectProjectPriority';
import { SelectProjectStatus } from '@/project/components/select/SelectProjectStatus';

export const projectsColumns = (
  _teams: ITeam[] | undefined,
): ColumnDef<IProject>[] => {
  const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<IProject>;
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
        const { updateProject } = useUpdateProject();
        const navigate = useNavigate();

        const handleUpdate = () => {
          if (value !== name) {
            updateProject({
              variables: { _id: cell.row.original._id, name: value },
            });
          }
        };

        return (
          <PopoverScoped
            scope={clsx(
              ProjectHotKeyScope.ProjectTableCell,
              cell.row.original._id,
              'Name',
            )}
            closeOnEnter
            onOpenChange={(open) => {
              if (!open) {
                handleUpdate();
              }
            }}
          >
            <RecordTableInlineCell.Trigger>
              <RecordTableInlineCell.Anchor
                onClick={() => navigate(`${cell.row.original._id}/overview`)}
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
          <SelectProjectPriority
            projectId={cell.row.original._id}
            value={cell.row.original.priority}
            inInlineCell
          />
        );
      },
      size: 170,
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: () => (
        <RecordTable.InlineHead label="Status" icon={IconProgressCheck} />
      ),
      cell: ({ cell }) => {
        return (
          <SelectProjectStatus
            inInlineCell
            projectId={cell.row.original._id}
            value={cell.row.original.status || 0}
          />
        );
      },
      size: 170,
    },
    {
      id: 'teamIds',
      header: () => (
        <RecordTable.InlineHead label="Team" icon={IconUsersGroup} />
      ),
      cell: ({ cell }) => {
        return (
          <SelectProjectTeam
            projectId={cell.row.original._id}
            value={cell.row.original.teamIds || []}
            variant="table"
          />
        );
      },
      size: 240,
    },
    {
      id: 'leadId',
      header: () => <RecordTable.InlineHead label="Lead" icon={IconUser} />,
      cell: ({ cell }) => {
        return (
          <SelectLead.InlineCell
            id={cell.row.original._id}
            value={cell.row.original.leadId}
            teamIds={cell.row.original.teamIds}
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
          <DateSelect.InlineCell
            type="start"
            status={cell.row.original.status || 0}
            value={startDate ? new Date(startDate) : undefined}
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
          <DateSelect.InlineCell
            type="target"
            status={cell.row.original.status || 0}
            value={targetDate ? new Date(targetDate) : undefined}
            id={cell.row.original._id}
          />
        );
      },
      size: 240,
    },
  ];
};
