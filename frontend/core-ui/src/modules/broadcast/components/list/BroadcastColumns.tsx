import { IconLabelFilled, IconUser } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { useMemo } from 'react';
import { useBroadcastEmailScope } from '../../hooks/useBroadcastEmailScope';
import { Badge, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { BroadcastBrandCell } from './cells/BroadcastBrandCell';
import { BroadcastFromCell } from './cells/BroadcastFromCell';
import { BroadcastMethodCell } from './cells/BroadcastMethodCell';
import { BroadcastMoreCell } from './cells/BroadcastMoreCell';
import { BroadcastNameCell } from './cells/BroadcastNameCell';
import { BroadcastReachedCell } from './cells/BroadcastReachedCell';
import { BroadcastStatusCell } from './cells/BroadcastStatusCell';
import { BroadcastTriggerCell } from './cells/BroadcastTriggerCell';
import { useTranslation } from 'react-i18next';
import { TBroadcastMessage } from '../../types';

/**
 * What the campaign table shows, and in what order.
 *
 * A cell that needs a hook or a decision of its own is a named component in
 * `cells/`; only the ones that read a single value and draw it stay here. That
 * split is what keeps this file readable as a list of columns rather than a
 * pile of small components.
 */
/** Columns are declared outside a component, so each heading carries its own. */
const Head = ({
  labelKey,
  icon,
}: {
  labelKey: string;
  icon: typeof IconLabelFilled;
}) => {
  const { t } = useTranslation('broadcasts');

  return <RecordTable.InlineHead label={t(labelKey)} icon={icon} />;
};

const BROADCAST_COLUMNS: ColumnDef<TBroadcastMessage>[] = [
  { id: 'more', cell: BroadcastMoreCell, size: 33 },
  RecordTable.checkboxColumn as ColumnDef<TBroadcastMessage>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <Head labelKey="columns.name" icon={IconLabelFilled} />,
    cell: ({ cell }) => (
      <BroadcastNameCell
        _id={cell.row.original?._id}
        title={cell.getValue() as string}
      />
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <Head labelKey="columns.status" icon={IconLabelFilled} />,
    cell: ({ cell }) => <BroadcastStatusCell row={cell.row.original} />,
    size: 140,
  },
  {
    id: 'totalCustomersCount',
    accessorKey: 'totalCustomersCount',
    header: () => <Head labelKey="columns.audience" icon={IconUser} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">
          <IconUser className="w-4 h-4" />
          {(cell.getValue() as number) || 0}
        </Badge>
      </RecordTableInlineCell>
    ),
    size: 130,
  },
  {
    id: 'reached',
    accessorKey: 'validCustomersCount',
    header: () => <Head labelKey="columns.reached" icon={IconLabelFilled} />,
    cell: ({ cell }) => (
      <BroadcastReachedCell
        reached={cell.row.original?.validCustomersCount}
        targeted={cell.row.original?.totalCustomersCount}
      />
    ),
    size: 110,
  },
  {
    id: 'method',
    accessorKey: 'method',
    header: () => <Head labelKey="columns.type" icon={IconLabelFilled} />,
    cell: ({ cell }) => (
      <BroadcastMethodCell method={cell.getValue() as string} />
    ),
    size: 150,
  },
  {
    // Named for what it shows. The cell works the trigger out from the
    // schedule, so keying it to the stored `kind` only invited the two to be
    // confused for one another again.
    id: 'trigger',
    header: () => <Head labelKey="trigger.label" icon={IconLabelFilled} />,
    cell: ({ cell }) => <BroadcastTriggerCell row={cell.row.original} />,
    size: 140,
  },
  {
    id: 'brandId',
    accessorKey: 'brandId',
    header: () => <Head labelKey="columns.brand" icon={IconLabelFilled} />,
    cell: ({ cell }) => (
      <BroadcastBrandCell brandId={cell.getValue() as string | undefined} />
    ),
  },
  {
    id: 'from',
    accessorKey: 'fromEmail',
    header: () => <Head labelKey="columns.from" icon={IconLabelFilled} />,
    cell: ({ cell }) => (
      <BroadcastFromCell
        method={cell.row.original?.method}
        fromEmail={cell.getValue() as string | undefined}
        fromUserId={cell.row.original?.fromUserId}
      />
    ),
  },
];

/** Columns that only mean something for an email campaign. */
const EMAIL_ONLY_COLUMNS = ['brandId', 'from'];

export const useBroadcastColumns = () => {
  const isEmailScope = useBroadcastEmailScope();

  return useMemo(
    () =>
      BROADCAST_COLUMNS.filter(
        (column) =>
          isEmailScope || !EMAIL_ONLY_COLUMNS.includes(column.id as string),
      ),
    [isEmailScope],
  );
};
