import {
  EMAIL_LANE_OPTIONS,
  EMAIL_SUPPRESSION_REASON_OPTIONS,
} from '@/settings/email-addresses/constants';
import { ReleaseEmailAddressDialog } from '@/settings/email-addresses/components/ReleaseEmailAddressDialog';
import {
  IEmailAddress,
  TEmailLane,
  TEmailSuppressionReason,
} from '@/settings/email-addresses/types';
import {
  IconAt,
  IconBan,
  IconLockOpen,
  IconMailCheck,
  IconMailExclamation,
  IconSend,
  IconTargetArrow,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useState } from 'react';

const LANE_VARIANTS: Record<TEmailLane, 'success' | 'warning' | 'destructive'> =
  {
    proven: 'success',
    unknown: 'warning',
    suppressed: 'destructive',
  };

const laneLabel = (lane: TEmailLane) =>
  EMAIL_LANE_OPTIONS.find((option) => option.value === lane)?.label ?? lane;

const reasonLabel = (reason: TEmailSuppressionReason) =>
  EMAIL_SUPPRESSION_REASON_OPTIONS.find((option) => option.value === reason)
    ?.label ?? reason;

export const emailAddressColumns: ColumnDef<IEmailAddress>[] = [
  {
    id: 'lane',
    accessorKey: 'lane',
    header: () => (
      <RecordTable.InlineHead icon={IconTargetArrow} label="Standing" />
    ),
    cell: ({ cell }) => {
      const lane = cell.getValue() as TEmailLane;

      return (
        <RecordTableInlineCell>
          <Badge variant={LANE_VARIANTS[lane]}>{laneLabel(lane)}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: () => <RecordTable.InlineHead icon={IconAt} label="Address" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 280,
  },
  {
    id: 'lastDeliveredAt',
    accessorKey: 'lastDeliveredAt',
    header: () => (
      <RecordTable.InlineHead icon={IconMailCheck} label="Last delivered" />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as string | undefined;

      if (!value) {
        return (
          <RecordTableInlineCell>
            <span className="text-muted-foreground">Never</span>
          </RecordTableInlineCell>
        );
      }

      return (
        <RelativeDateDisplay value={value} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={value} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'deliveredCount',
    accessorKey: 'deliveredCount',
    header: () => <RecordTable.InlineHead icon={IconSend} label="Delivered" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {(cell.getValue() as number) || 0}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'softBounceCount',
    accessorKey: 'softBounceCount',
    header: () => (
      <RecordTable.InlineHead icon={IconMailExclamation} label="Soft bounces" />
    ),
    cell: ({ cell }) => {
      const count = (cell.getValue() as number) || 0;

      return (
        <RecordTableInlineCell>
          {count ? (
            <Badge variant="warning">{count}</Badge>
          ) : (
            <span className="text-muted-foreground">0</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'suppressionReason',
    accessorKey: 'suppressionReason',
    header: () => <RecordTable.InlineHead icon={IconBan} label="Closed for" />,
    cell: ({ cell }) => {
      const reason = cell.getValue() as TEmailSuppressionReason | undefined;

      return (
        <RecordTableInlineCell>
          {reason ? (
            reasonLabel(reason)
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'release',
    header: () => <RecordTable.InlineHead icon={IconLockOpen} label="" />,
    cell: ({ cell }) => {
      const address = cell.row.original;
      const [open, setOpen] = useState(false);

      if (!address.suppressedAt) {
        return <RecordTableInlineCell />;
      }

      return (
        <RecordTableInlineCell>
          <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
            <IconLockOpen className="size-4" />
            Reopen
          </Button>
          <ReleaseEmailAddressDialog
            address={address}
            open={open}
            onOpenChange={setOpen}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
