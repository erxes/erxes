import {
  IconDots,
  IconCalendar,
  IconCalendarEvent,
  IconTag,
  IconToggleLeft,
  IconSettings,
  IconTicket,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Button,
  RelativeDateDisplay,
  Switch,
} from 'erxes-ui';
import { ICoupon } from '../types/couponTypes';
import { CouponNameCell } from '../coupon-detail/components/CouponNameCell';

const SafeRelativeDate = ({ value }: { value?: string }) => {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <RelativeDateDisplay value={value} asChild>
        <RelativeDateDisplay.Value value={value} />
      </RelativeDateDisplay>
    );
  } catch {
    return <span className="text-muted-foreground">-</span>;
  }
};

export const couponColumns: (
  editStatus: (options: any) => void,
) => ColumnDef<ICoupon>[] = (editStatus) => [
  RecordTable.checkboxColumn as ColumnDef<ICoupon>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Title" />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <CouponNameCell
          coupon={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Start Date" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <SafeRelativeDate value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarEvent} label="End Date" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <SafeRelativeDate value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead icon={IconTicket} label="Type" />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconToggleLeft} label="Status" />
    ),
    cell: ({ cell }) => {
      const { _id } = cell.row.original || {};
      const currentStatus = cell.getValue() as string;
      const isActive = currentStatus === 'active';

      return (
        <RecordTableInlineCell>
          <Switch
            className="mx-auto"
            checked={isActive}
            onCheckedChange={() => {
              editStatus({
                variables: {
                  _id,
                  status: isActive ? 'inactive' : 'active',
                },
              });
            }}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: () => (
      <RecordTable.InlineHead icon={IconSettings} label="Actions" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <Button className="mx-auto" variant="ghost" size="sm">
            <IconDots className="h-4 w-4" />
          </Button>
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
];
