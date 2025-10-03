/* eslint-disable react-hooks/rules-of-hooks */
import { useNavigate } from 'react-router-dom';
import {
  IconCalendarFilled,
  IconProgressCheck,
  IconLabelFilled,
  IconProgress,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { DateSelect } from '@/cycle/components/DateSelect';
import {
  Badge,
  Input,
  RecordTable,
  RecordTableInlineCell,
  PopoverScoped,
  ChartContainer,
} from 'erxes-ui';
import { ICycle } from '@/cycle/types';
import { useState } from 'react';
import { CycleHotKeyScope } from '@/cycle/CycleHotkeyScope';
import { useUpdateCycle } from '@/cycle/hooks/useUpdateCycle';
import { ChartConfig } from 'erxes-ui';
import clsx from 'clsx';
import { PolarAngleAxis, RadialBar, RadialBarChart } from 'recharts';
import { CycleStatusDisplay } from '@/cycle/components/CycleStatusDisplay';

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  safari: {
    label: 'Done',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

const checkBoxColumn = RecordTable.checkboxColumn as ColumnDef<ICycle>;
export const cyclesColumns: ColumnDef<ICycle>[] = [
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
      const { updateCycle } = useUpdateCycle();
      const navigate = useNavigate();

      const handleUpdate = () => {
        if (value !== name) {
          updateCycle({
            variables: { _id: cell.row.original._id, name: value },
          });
        }
      };

      const url = `/operation/team/${cell.row.original.teamId}/cycles/${cell.row.original._id}`;

      return (
        <PopoverScoped
          closeOnEnter
          onOpenChange={(open) => {
            if (!open) {
              handleUpdate();
            }
          }}
          scope={clsx(
            CycleHotKeyScope.CycleTableCell,
            cell.row.original._id,
            'Name',
          )}
        >
          <RecordTableInlineCell.Trigger>
            <Badge
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(url);
              }}
            >
              {name}
            </Badge>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content className="min-w-72">
            <Input
              value={value || ''}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
              // onKeyDown={(e) => {
              //   if (e.key === 'Enter') {
              //     e.preventDefault();
              //     handleUpdate();
              //   }
              // }}
            />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      );
    },
    size: 240,
  },
  {
    id: 'donePercent',
    accessorKey: 'donePercent',
    header: () => (
      <RecordTable.InlineHead label="Progress" icon={IconProgress} />
    ),
    cell: ({ cell }) => {
      const { donePercent } = cell.row.original;
      return (
        <RecordTableInlineCell>
          <ChartContainer config={chartConfig} className="aspect-square size-6">
            <RadialBarChart
              width={24}
              height={24}
              cx={12}
              cy={12}
              innerRadius={6}
              outerRadius={10}
              data={[
                {
                  name: 'Progress',
                  value: donePercent,
                  fill: 'hsl(var(--primary))',
                },
              ]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background={{ fill: 'hsl(var(--border))' }}
                dataKey="value"
                cornerRadius={10}
              />
            </RadialBarChart>
          </ChartContainer>
          <span className="text-sm text-accent-foreground">{donePercent}%</span>
        </RecordTableInlineCell>
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
      const { isActive, isCompleted } = cell.row.original;
      return (
        <RecordTableInlineCell>
          <CycleStatusDisplay isActive={isActive} isCompleted={isCompleted} />
        </RecordTableInlineCell>
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
          value={startDate ? new Date(startDate) : undefined}
          id={cell.row.original._id}
        />
      );
    },
    size: 240,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => (
      <RecordTable.InlineHead label="End Date" icon={IconCalendarFilled} />
    ),
    cell: ({ cell }) => {
      const { endDate, startDate } = cell.row.original;
      return (
        <DateSelect.InlineCell
          startDate={startDate ? new Date(startDate) : undefined}
          type="end"
          value={endDate ? new Date(endDate) : undefined}
          id={cell.row.original._id}
        />
      );
    },
    size: 240,
  },
];
