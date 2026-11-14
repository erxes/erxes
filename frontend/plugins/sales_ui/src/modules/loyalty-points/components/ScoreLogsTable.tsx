import {
  IconAlertTriangle,
  IconCalendarFilled,
  IconCoins,
  IconExternalLink,
  IconUser,
  IconWallet,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { Button, cn, Empty, RecordTable, Skeleton } from 'erxes-ui';
import { createContext, ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TScoreLogEntry } from '../hooks/useScoreLogsByIds';
import { scoreLogActionKind } from '../scoreLogActions';
import { ScoreLogActionGuide, ScoreLogActionLabel } from './ScoreLogActionHelp';

export const LogsLoadingContext = createContext(false);

export const Cell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span className={cn('flex h-full items-center truncate px-2', className)}>
    {children}
  </span>
);

// Loyalty fills the row after sales has listed it.
export const LogCell = ({
  log,
  children,
}: {
  log?: TScoreLogEntry;
  children: (log: TScoreLogEntry) => ReactNode;
}) => {
  const logsLoading = useContext(LogsLoadingContext);

  if (log) {
    return <>{children(log)}</>;
  }

  return logsLoading ? <Skeleton className="m-2 h-4 w-16" /> : null;
};

const ownerName = (owner: unknown) => {
  if (!owner || typeof owner !== 'object') {
    return '';
  }

  const { firstName, lastName, primaryEmail, primaryPhone } = owner as Record<
    string,
    string | undefined
  >;

  return (
    [firstName, lastName].filter(Boolean).join(' ') ||
    primaryEmail ||
    primaryPhone ||
    ''
  );
};

// Text with an open icon on hover, like the copyable cells elsewhere.
export const OpenableCell = ({
  label,
  title,
  children,
}: {
  label: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <Cell className="group justify-between gap-1">
    {label}
    <Button
      size="icon"
      variant="ghost"
      className="hidden shrink-0 group-hover:flex"
      title={title}
      asChild
    >
      {children}
    </Button>
  </Cell>
);

// The customer opens on the Contacts page; its sheet is not shared with plugins.
export const OwnerCell = ({ log }: { log: TScoreLogEntry }) => {
  const { t } = useTranslation('sales');
  const name = ownerName(log.owner);

  if (log.ownerType !== 'customer' || !log.ownerId) {
    return <Cell>{name}</Cell>;
  }

  return (
    <OpenableCell
      label={name}
      title={t('loyalty-log-open-customer', 'Open customer')}
    >
      <Link to={`/contacts/customers?contactId=${log.ownerId}`}>
        <IconExternalLink size={14} />
      </Link>
    </OpenableCell>
  );
};

/** The columns every source's list shares: what loyalty knows of an entry. */
export const useScoreLogColumns = <
  TRow extends { log?: TScoreLogEntry },
>(): ColumnDef<TRow>[] => {
  const { t } = useTranslation('sales');

  return [
    {
      id: 'action',
      header: () => (
        <ScoreLogActionGuide>
          <RecordTable.InlineHead
            label={t('loyalty-log-action', 'Action')}
            icon={IconWallet}
          />
        </ScoreLogActionGuide>
      ),
      cell: ({ row }) => (
        <LogCell log={row.original.log}>
          {(log) => (
            <Cell>
              <ScoreLogActionLabel
                kind={scoreLogActionKind(log)}
                fallback={log.action || ''}
              />
            </Cell>
          )}
        </LogCell>
      ),
      size: 170,
    },
    {
      id: 'points',
      header: () => (
        <RecordTable.InlineHead
          label={t('loyalty-deal-points')}
          icon={IconCoins}
        />
      ),
      cell: ({ row }) => (
        <LogCell log={row.original.log}>
          {({ change }) => {
            const points = change || 0;

            return (
              <Cell
                className={cn(
                  'tabular-nums',
                  points > 0 && 'font-medium text-success',
                  points < 0 && 'font-medium text-destructive',
                )}
              >
                {points > 0 ? '+' : ''}
                {points.toLocaleString()}
              </Cell>
            );
          }}
        </LogCell>
      ),
      size: 120,
    },
    {
      id: 'campaign',
      header: () => (
        <RecordTable.InlineHead
          label={t('loyalty-log-campaign', 'Campaign')}
          icon={IconWallet}
        />
      ),
      cell: ({ row }) => (
        <LogCell log={row.original.log}>
          {({ campaign }) => <Cell>{campaign?.title || ''}</Cell>}
        </LogCell>
      ),
      size: 180,
    },
    {
      id: 'owner',
      header: () => (
        <RecordTable.InlineHead
          label={t('loyalty-log-owner', 'Customer')}
          icon={IconUser}
        />
      ),
      cell: ({ row }) => (
        <LogCell log={row.original.log}>
          {(log) => <OwnerCell log={log} />}
        </LogCell>
      ),
      size: 180,
    },
    {
      id: 'createdAt',
      header: () => (
        <RecordTable.InlineHead
          label={t('loyalty-log-date', 'Date')}
          icon={IconCalendarFilled}
        />
      ),
      cell: ({ row }) => (
        <LogCell log={row.original.log}>
          {({ createdAt }) => (
            <Cell className="tabular-nums text-muted-foreground">
              {createdAt ? new Date(createdAt).toLocaleString() : ''}
            </Cell>
          )}
        </LogCell>
      ),
      size: 180,
    },
  ];
};

export const ScoreLogsEmpty = ({
  description,
  error,
  onRetry,
}: {
  description: string;
  error?: boolean;
  onRetry: () => void;
}) => {
  const { t } = useTranslation('sales');

  return (
    <Empty className="h-full border-0 bg-transparent">
      <Empty.Header>
        <Empty.Media variant="icon">
          {error ? <IconAlertTriangle /> : <IconCoins />}
        </Empty.Media>
        <Empty.Title>
          {error
            ? t('loyalty-logs-error', 'Could not load point movements')
            : t('loyalty-logs-empty', 'No point movements')}
        </Empty.Title>
        <Empty.Description>
          {error
            ? t(
                'loyalty-logs-error-description',
                'Check the connection and try again.',
              )
            : description}
        </Empty.Description>
      </Empty.Header>
      {error && (
        <Button variant="outline" onClick={onRetry}>
          {t('retry', 'Try again')}
        </Button>
      )}
    </Empty>
  );
};

export const ScoreLogsTableView = <TRow extends { _id: string }>({
  columns,
  rows,
  loading,
  logsLoading,
  error,
  hasNextPage,
  handleFetchMore,
  retry,
  tableId,
  stickyColumn,
  emptyDescription,
}: {
  columns: ColumnDef<TRow>[];
  rows: TRow[];
  loading: boolean;
  logsLoading: boolean;
  error?: Error | null;
  hasNextPage: boolean;
  handleFetchMore: () => void;
  retry: () => void;
  tableId: string;
  stickyColumn: string;
  emptyDescription: string;
}) => {
  if (error && !rows.length) {
    return (
      <ScoreLogsEmpty error onRetry={retry} description={emptyDescription} />
    );
  }

  if (!loading && !rows.length) {
    return <ScoreLogsEmpty onRetry={retry} description={emptyDescription} />;
  }

  return (
    <LogsLoadingContext.Provider value={logsLoading}>
      <div className="flex flex-col overflow-hidden h-full relative">
        <RecordTable.Provider
          columns={columns}
          data={rows}
          className="m-3 h-full"
          stickyColumns={[stickyColumn]}
          tableId={tableId}
        >
          <RecordTable.CursorProvider
            dataLength={rows.length}
            hasPreviousPage={false}
            hasNextPage={hasNextPage}
          >
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                {loading && <RecordTable.RowSkeleton rows={20} />}
                <RecordTable.RowList />
                <RecordTable.CursorForwardSkeleton
                  handleFetchMore={handleFetchMore}
                />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.CursorProvider>
        </RecordTable.Provider>
      </div>
    </LogsLoadingContext.Provider>
  );
};
