import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef } from '@tanstack/table-core';
import {
  Alert,
  Button,
  cn,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IconChevronLeft,
  IconChevronRight,
  IconExternalLink,
} from '@tabler/icons-react';

import { FrontlineCard } from '../frontline-card/FrontlineCard';
import { ChartExportButton } from '../chart-export/ChartExportButton';
import { FacebookReportFilter } from '../filter-popover/facebook-report-filter';
import { SyncFacebookStatsButton } from './SyncFacebookStatsButton';
import { ReportChartActions } from '../report-chart/ReportChartActions';
import { useFacebookPosts } from '@/report/hooks/useFacebookReport';
import { useFacebookChartCard } from '@/report/hooks/useFacebookChartCard';
import { FacebookPostRow, ReportChart } from '@/report/types';

const DESCRIPTION =
  'Posts published in the selected period and their engagement';
const PAGE_SIZE = 10;

interface FacebookPostsProps {
  title: string;
  cardId?: string;
  savedChart?: ReportChart;
  colSpan?: 6 | 12;
  onColSpanChange?: (span: 6 | 12) => void;
}

export const FacebookPosts = ({
  title,
  cardId,
  savedChart,
  colSpan = 12,
  onColSpanChange,
}: FacebookPostsProps) => {
  const { t } = useTranslation('frontline');
  const { id, filterConfig, queryFilters, filtersRestored } =
    useFacebookChartCard({ title, cardId, savedChart });
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  const { facebookPosts, loading, error } = useFacebookPosts({
    variables: { filters: { ...queryFilters, limit: PAGE_SIZE, page } },
    skip: !filtersRestored,
  });

  const posts = useMemo(() => facebookPosts?.list || [], [facebookPosts]);
  const totalPages = facebookPosts?.totalPages ?? 1;
  const lastSyncedAt = useMemo(() => {
    const stamps = posts
      .map((post) => post.metaSyncedAt)
      .filter((value): value is string => Boolean(value));

    return stamps.length ? stamps.sort().at(-1) : undefined;
  }, [posts]);

  const exportColumns = useMemo(
    () => [
      { key: '_id' as const, header: 'Post id' },
      { key: 'content' as const, header: 'Content' },
      { key: 'comments' as const, header: 'Comments' },
      { key: 'replies' as const, header: 'Replies' },
      { key: 'commenters' as const, header: 'Commenters' },
      { key: 'metaCommentCount' as const, header: 'Comments on Meta' },
      { key: 'metaReactionCount' as const, header: 'Reactions on Meta' },
      { key: 'metaShareCount' as const, header: 'Shares on Meta' },
      { key: 'permalink' as const, header: 'Permalink' },
    ],
    [],
  );

  const filterEl = (
    <>
      <FacebookReportFilter cardId={id} showSearch />
      <SyncFacebookStatsButton pageIds={filterConfig.pageIds} />
      <ReportChartActions
        chartType="facebook-posts"
        colSpan={colSpan}
        filters={filterConfig}
        savedChart={savedChart}
      />
      <ChartExportButton
        data={posts}
        columns={exportColumns}
        filename="facebook-posts"
      />
    </>
  );

  if (!filtersRestored || (loading && !facebookPosts)) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={DESCRIPTION}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Skeleton />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (error) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={DESCRIPTION}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <Alert variant="destructive">
            <Alert.Title>{t('error-loading-data')}</Alert.Title>
            <Alert.Description>{error.message}</Alert.Description>
          </Alert>
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  if (!posts.length) {
    return (
      <FrontlineCard
        id={id}
        title={title}
        description={DESCRIPTION}
        colSpan={colSpan}
        onColSpanChange={onColSpanChange}
      >
        <FrontlineCard.Header filter={filterEl} />
        <FrontlineCard.Content>
          <FrontlineCard.Empty />
        </FrontlineCard.Content>
      </FrontlineCard>
    );
  }

  return (
    <FrontlineCard
      id={id}
      title={title}
      description={DESCRIPTION}
      colSpan={colSpan}
      onColSpanChange={onColSpanChange}
    >
      <FrontlineCard.Header filter={filterEl} />
      <FrontlineCard.Content>
        {lastSyncedAt && (
          <p className="px-1 pb-2 text-xs text-muted-foreground">
            {t('facebook-last-synced', {
              time: new Date(lastSyncedAt).toLocaleString(),
            })}
          </p>
        )}
        <div
          className={cn(
            'bg-sidebar w-full rounded-lg transition-opacity',
            loading && 'opacity-60',
          )}
        >
          <RecordTable.Provider
            data={posts}
            columns={postColumns}
            className="m-3"
          >
            <RecordTable.Scroll>
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  <RecordTable.RowList />
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.Scroll>
          </RecordTable.Provider>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t">
            <span className="text-xs text-muted-foreground">
              {facebookPosts?.totalCount ?? 0} items
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || loading}
              >
                <IconChevronLeft className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages || loading}
              >
                <IconChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </FrontlineCard.Content>
    </FrontlineCard>
  );
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : '-';

export const postColumns: ColumnDef<FacebookPostRow>[] = [
  {
    id: 'content',
    header: 'Post',
    accessorKey: 'content',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs">
        <TextOverflowTooltip value={(cell.getValue() as string) || '-'} />
      </RecordTableInlineCell>
    ),
    size: 320,
  },
  {
    id: 'postedAt',
    header: 'Posted',
    accessorKey: 'postedAt',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs text-muted-foreground">
        {formatDate(cell.getValue() as string)}
      </RecordTableInlineCell>
    ),
    size: 60,
  },
  {
    id: 'comments',
    header: 'Comments',
    accessorKey: 'comments',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs">
        {(cell.getValue() as number) ?? 0}
      </RecordTableInlineCell>
    ),
    size: 40,
  },
  {
    id: 'replies',
    header: 'Replies',
    accessorKey: 'replies',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs">
        {(cell.getValue() as number) ?? 0}
      </RecordTableInlineCell>
    ),
    size: 40,
  },
  {
    id: 'commenters',
    header: 'People',
    accessorKey: 'commenters',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs">
        {(cell.getValue() as number) ?? 0}
      </RecordTableInlineCell>
    ),
    size: 40,
  },
  {
    id: 'metaCommentCount',
    header: 'On Meta',
    accessorKey: 'metaCommentCount',
    cell: ({ cell }) => {
      const { metaCommentCount, comments, replies } = cell.row.original || {};

      if (metaCommentCount === undefined || metaCommentCount === null) {
        return (
          <RecordTableInlineCell className="px-4 text-xs text-muted-foreground">
            —
          </RecordTableInlineCell>
        );
      }

      const diff = metaCommentCount - ((comments ?? 0) + (replies ?? 0));

      return (
        <RecordTableInlineCell className="px-4 text-xs">
          {metaCommentCount}
          {diff !== 0 && (
            <span
              className={cn(
                'ml-1',
                diff > 0 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              {diff > 0 ? `+${diff}` : diff}
            </span>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 50,
  },
  {
    id: 'metaReactionCount',
    header: 'Reactions',
    accessorKey: 'metaReactionCount',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs text-muted-foreground">
        {(cell.getValue() as number) ?? '—'}
      </RecordTableInlineCell>
    ),
    size: 40,
  },
  {
    id: 'lastActivityAt',
    header: 'Last activity',
    accessorKey: 'lastActivityAt',
    cell: ({ cell }) => (
      <RecordTableInlineCell className="px-4 text-xs text-muted-foreground">
        {formatDate(cell.getValue() as string)}
      </RecordTableInlineCell>
    ),
    size: 60,
  },
  {
    id: 'permalink',
    header: 'Link',
    accessorKey: 'permalink',
    cell: ({ cell }) => {
      const permalink = cell.getValue() as string;

      return (
        <RecordTableInlineCell className="px-4 text-xs">
          {permalink ? (
            <a
              href={permalink}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center gap-1"
            >
              <IconExternalLink className="size-3.5" />
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 30,
  },
];
