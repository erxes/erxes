import {
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconExternalLink,
  IconLoader2,
  IconUser,
  TablerIcon,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  BadgeProps,
  Button,
  cn,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { Link } from 'react-router';
import { TBroadcastRecipient, TRecipientOutcome } from '../../../types';
import {
  recipientOutcome,
  recipientReason,
} from '../../../utils/recipientOutcome';
import { useTranslation } from 'react-i18next';

const Head = ({ labelKey, icon }: { labelKey: string; icon?: TablerIcon }) => {
  const { t } = useTranslation('broadcasts');

  return <RecordTable.InlineHead label={t(labelKey)} icon={icon} />;
};

const OUTCOME_BADGE: Record<
  TRecipientOutcome,
  { icon: TablerIcon; variant: BadgeProps['variant'] }
> = {
  done: { icon: IconCircleCheck, variant: 'success' },
  processing: { icon: IconLoader2, variant: 'info' },
  queued: { icon: IconClock, variant: 'secondary' },
  skipped: { icon: IconAlertTriangle, variant: 'warning' },
  failed: { icon: IconAlertTriangle, variant: 'destructive' },
};

/** The manifest holds an id; the name comes from the contact it points at. */
export const recipientDisplayName = (recipient: TBroadcastRecipient) => {
  const { customer, customerId } = recipient;
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ');

  return name || customer?.primaryEmail || customer?.primaryPhone || customerId;
};

const CustomerCell = ({ recipient }: { recipient: TBroadcastRecipient }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <RecordTableInlineCell className="group/customer gap-1">
      <span className="flex-auto truncate">
        {recipientDisplayName(recipient)}
      </span>

      {!!recipient.customer && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="size-5 flex-none opacity-0 group-hover/customer:opacity-100"
          // The row opens this person's flow below; the link leaves for their
          // record, which is a different intent.
          onClick={(event) => event.stopPropagation()}
        >
          <Link
            to={`/contacts/customers?contactId=${recipient.customerId}`}
            aria-label={t('recipients.open-customer')}
          >
            <IconExternalLink className="size-3.5" />
          </Link>
        </Button>
      )}
    </RecordTableInlineCell>
  );
};

const StatusCell = ({ recipient }: { recipient: TBroadcastRecipient }) => {
  const outcome = recipientOutcome(recipient);
  const { icon: Icon, variant } = OUTCOME_BADGE[outcome];

  return (
    <RecordTableInlineCell>
      <Badge variant={variant} className="gap-1 capitalize">
        <Icon
          className={cn('size-3', outcome === 'processing' && 'animate-spin')}
        />
        {outcome}
      </Badge>
    </RecordTableInlineCell>
  );
};

/**
 * Only built when the loaded page has a reason to show. A healthy run has one
 * for nobody, and a column that is then all dashes says less than no column.
 */
const reasonColumn: ColumnDef<TBroadcastRecipient> = {
  id: 'reason',
  accessorKey: 'reason',
  header: () => <Head labelKey="recipients.reason" />,
  cell: ({ cell }) => (
    <RecordTableInlineCell className="text-muted-foreground">
      {recipientReason(cell.row.original) || '—'}
    </RecordTableInlineCell>
  ),
  size: 260,
};

const baseColumns: ColumnDef<TBroadcastRecipient>[] = [
  {
    id: 'customer',
    accessorKey: 'customerId',
    header: () => <Head labelKey="recipients.customer" icon={IconUser} />,
    cell: ({ cell }) => <CustomerCell recipient={cell.row.original} />,
    size: 280,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <Head labelKey="columns.status" />,
    cell: ({ cell }) => <StatusCell recipient={cell.row.original} />,
    size: 140,
  },
];

const updatedColumn: ColumnDef<TBroadcastRecipient> = {
  id: 'updatedAt',
  accessorKey: 'updatedAt',
  header: () => <Head labelKey="recipients.updated" />,
  cell: ({ cell }) => {
    const { updatedAt, finishedAt, createdAt } = cell.row.original;
    const value = updatedAt || finishedAt || createdAt;

    return (
      <RecordTableInlineCell>
        {value ? (
          <RelativeDateDisplay value={value} asChild>
            <span className="text-muted-foreground">
              <RelativeDateDisplay.Value value={value} />
            </span>
          </RelativeDateDisplay>
        ) : (
          '—'
        )}
      </RecordTableInlineCell>
    );
  },
  size: 160,
};

export const buildRecipientColumns = (
  recipients: TBroadcastRecipient[],
): ColumnDef<TBroadcastRecipient>[] =>
  recipients.some((recipient) => recipientReason(recipient))
    ? [...baseColumns, reasonColumn, updatedColumn]
    : [...baseColumns, updatedColumn];
