import {
  IEmailDeliveryRow,
  TEmailDeliveryStatus,
  TEmailHandoffStatus,
} from '@/settings/email-deliveries/types';
import {
  IconAlertTriangle,
  IconCalendarTime,
  IconMail,
  IconMailForward,
  IconProgressCheck,
  IconProgressX,
  IconSend,
  IconSourceCode,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import dayjs from 'dayjs';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useQueryState,
} from 'erxes-ui';

const HANDOFF_VARIANTS: Record<
  TEmailHandoffStatus,
  { variant: 'success' | 'destructive' | 'secondary'; Icon: typeof IconSend }
> = {
  sent: { variant: 'success', Icon: IconProgressCheck },
  failed: { variant: 'destructive', Icon: IconProgressX },
  queued: { variant: 'secondary', Icon: IconSend },
};

const DELIVERY_VARIANTS: Record<
  TEmailDeliveryStatus,
  'success' | 'destructive' | 'secondary'
> = {
  delivered: 'success',
  opened: 'success',
  clicked: 'success',
  bounced: 'destructive',
  complained: 'destructive',
  dropped: 'destructive',
};

export const emailDeliveryColumns: ColumnDef<IEmailDeliveryRow>[] = [
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconSend} label="Status" />,
    cell: ({ cell }) => {
      const status = cell.getValue() as TEmailHandoffStatus;
      const [, setDeliveryId] = useQueryState<string>('deliveryId');
      const { variant, Icon } = HANDOFF_VARIANTS[status] || {};

      return (
        <RecordTableInlineCell
          onClick={() => setDeliveryId(cell.row.original._id)}
        >
          <Badge variant={variant}>
            {Icon && <Icon className="size-4" />}
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'deliveryStatus',
    accessorKey: 'deliveryStatus',
    header: () => (
      <RecordTable.InlineHead icon={IconMailForward} label="Delivery" />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue() as TEmailDeliveryStatus | undefined;

      return (
        <RecordTableInlineCell>
          {status ? (
            <Badge variant={DELIVERY_VARIANTS[status]}>{status}</Badge>
          ) : (
            // SMTP relays push no events, so there is nothing to report here.
            <span className="text-muted-foreground">—</span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendarTime} label="Date" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <RelativeDateDisplay.Value
          value={dayjs(cell.getValue() as string).format('YYYY-MM-DD HH:mm:ss')}
        />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'toEmails',
    accessorKey: 'toEmails',
    header: () => <RecordTable.InlineHead icon={IconMail} label="To" />,
    cell: ({ cell }) => {
      const emails = (cell.getValue() as string[]) || [];

      return (
        <RecordTableInlineCell>
          <span title={emails.join(', ')}>
            {emails[0]}
            {emails.length > 1 && (
              <span className="ml-1 text-muted-foreground">
                +{emails.length - 1}
              </span>
            )}
          </span>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'subject',
    accessorKey: 'subject',
    header: () => <RecordTable.InlineHead icon={IconMail} label="Subject" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'from',
    accessorKey: 'from',
    header: () => <RecordTable.InlineHead icon={IconUser} label="From" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'source',
    accessorKey: 'source',
    header: () => (
      <RecordTable.InlineHead icon={IconSourceCode} label="Source" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'provider',
    accessorKey: 'provider',
    header: () => <RecordTable.InlineHead icon={IconSend} label="Provider" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'error',
    accessorKey: 'error',
    header: () => (
      <RecordTable.InlineHead icon={IconAlertTriangle} label="Error" />
    ),
    cell: ({ cell }) => {
      const error = cell.getValue() as string | undefined;

      return (
        <RecordTableInlineCell>
          {error && (
            <span className="text-destructive" title={error}>
              {error}
            </span>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];
