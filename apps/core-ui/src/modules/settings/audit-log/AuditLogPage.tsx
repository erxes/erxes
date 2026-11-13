import { IconDownload, IconShieldCheck } from '@tabler/icons-react';
import { type InfiniteData, skipToken, useInfiniteQuery } from '@tanstack/react-query';
import { Button, DropdownMenu, Empty, PageContainer, PageHeader, ScrollArea } from 'erxes-ui';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import type { AuditEntry } from '@erxes/core-contract';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { orpc } from '~/lib/api';
import { type CursorPage, forwardPaging } from '~/lib/cursorList';
import { useCan } from '~/modules/auth/session';
import { AuditTable } from './AuditEntries';
import { AuditFilterBar } from './AuditFilterBar';
import { AuditStreams } from './AuditStreams';
import { IntegrityCheck, Retention } from './AuditTools';
import { exportUrl, type Filters, NO_FILTERS, queryOf } from './auditFilters';

const flatten = ({ pages }: Pick<InfiniteData<CursorPage<AuditEntry>>, 'pages'>) => ({
  entries: pages.flatMap((page) => page.data),
  first: pages[0],
});

const ExportMenu = ({ filters }: { filters: Filters }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline">
          <IconDownload />
          {t('export', 'Export')}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        <DropdownMenu.Item asChild>
          <a href={exportUrl(filters, 'csv')}>{t('export-csv', 'CSV (spreadsheets)')}</a>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <a href={exportUrl(filters, 'json')}>{t('export-json', 'JSON (SIEM, scripts)')}</a>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const NothingRecorded = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });

  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconShieldCheck />
        </Empty.Media>
        <Empty.Title>{t('empty', 'Nothing recorded yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Sign-ins, team changes, deletes and settings changes appear here.',
          )}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

const Total = ({ first }: { first: CursorPage<AuditEntry> | undefined }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });

  if (!first) return null;

  return first.totalCapped
    ? t('count-capped', {
        count: first.totalCount,
        defaultValue: `${first.totalCount.toLocaleString()}+ entries`,
      })
    : t('count', { count: first.totalCount, defaultValue: `${first.totalCount} entries` });
};

/** Settings › Audit log: who changed what, in core and every plugin (owners and admins). */
export const AuditLogPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'audit-log' });
  const can = useCan();
  const canSee = can('audit.view');
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const deferred = useDeferredValue(filters);

  const list = useInfiniteQuery(
    orpc.audit.list.infiniteOptions({
      ...forwardPaging(50),
      input: canSee ? (page) => ({ ...page, ...queryOf(deferred) }) : skipToken,
      select: flatten,
    }),
  );

  if (!canSee) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Audit log'), to: '/settings/audit-log', icon: IconShieldCheck },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Retention isOwner={can('audit.retention')} />
          {can('audit.stream') && <AuditStreams />}
          <IntegrityCheck />
          <ExportMenu filters={deferred} />
        </PageHeader.End>
      </PageHeader>
      <AuditFilterBar
        filters={filters}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        total={<Total first={list.data?.first} />}
      />
      <ScrollArea className="flex-1">
        <QueryState
          query={list}
          className="py-12"
          isEmpty={({ entries }) => !entries.length}
          empty={<NothingRecorded />}
        >
          {({ entries }) => (
            <AuditTable
              entries={entries}
              paging={{
                hasNextPage: list.hasNextPage,
                isFetchingNextPage: list.isFetchingNextPage,
                fetchNextPage: () => void list.fetchNextPage(),
              }}
            />
          )}
        </QueryState>
      </ScrollArea>
    </PageContainer>
  );
};
