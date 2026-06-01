import { ColumnDef } from '@tanstack/react-table';
import {
  IconClock,
  IconEye,
  IconFileAnalytics,
  IconLink,
  IconUsers,
} from '@tabler/icons-react';
import {
  Card,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CmsAnalyticsTopPage } from '../types';
import {
  formatAnalyticsDuration,
  formatAnalyticsNumber,
} from '../utils/formatAnalytics';

type CmsAnalyticsTopPageRow = CmsAnalyticsTopPage & {
  _id: string;
};

type AnalyticsTopPagesTableProps = {
  pages: CmsAnalyticsTopPage[];
};

export const AnalyticsTopPagesTable = ({
  pages,
}: AnalyticsTopPagesTableProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics',
  });

  const rows = useMemo<CmsAnalyticsTopPageRow[]>(
    () =>
      pages.map((page, index) => ({
        ...page,
        _id: `${page.pagePath}:${page.pageTitle || ''}:${index}`,
      })),
    [pages],
  );

  const columns = useMemo<ColumnDef<CmsAnalyticsTopPageRow>[]>(
    () => [
      {
        id: 'page',
        accessorKey: 'pagePath',
        header: () => (
          <RecordTable.InlineHead
            icon={IconFileAnalytics}
            label={t('table.page')}
          />
        ),
        cell: ({ row }) => {
          const page = row.original;
          const pageName = page.pageTitle?.trim() || page.pagePath;
          const showPagePath = page.pagePath !== pageName;

          return (
            <RecordTableInlineCell>
              <div className="flex min-w-0 flex-col gap-1 py-1.5">
                <div className="min-w-0">
                  <TextOverflowTooltip
                    value={pageName}
                    className="text-sm font-semibold text-foreground"
                  />
                </div>
                {showPagePath ? (
                  <div className="inline-flex max-w-full items-center gap-1.5 self-start rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground">
                    <IconLink className="size-3 flex-none text-muted-foreground/70" />
                    <TextOverflowTooltip
                      value={page.pagePath}
                      className="min-w-0 font-mono text-[11px] leading-4"
                    />
                  </div>
                ) : null}
              </div>
            </RecordTableInlineCell>
          );
        },
        size: 320,
      },
      {
        id: 'views',
        accessorKey: 'screenPageViews',
        header: () => (
          <RecordTable.InlineHead icon={IconEye} label={t('table.views')} />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell className="justify-end text-right font-medium tabular-nums">
            {formatAnalyticsNumber(row.original.screenPageViews)}
          </RecordTableInlineCell>
        ),
        size: 120,
      },
      {
        id: 'users',
        accessorKey: 'activeUsers',
        header: () => (
          <RecordTable.InlineHead icon={IconUsers} label={t('table.users')} />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell className="justify-end text-right tabular-nums">
            {formatAnalyticsNumber(row.original.activeUsers)}
          </RecordTableInlineCell>
        ),
        size: 120,
      },
      {
        id: 'engagement',
        accessorKey: 'averageEngagementTime',
        header: () => (
          <RecordTable.InlineHead
            icon={IconClock}
            label={t('table.engagement')}
          />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell className="justify-end text-right tabular-nums">
            {formatAnalyticsDuration(row.original.averageEngagementTime)}
          </RecordTableInlineCell>
        ),
        size: 150,
      },
    ],
    [t],
  );

  return (
    <Card className="rounded-lg border shadow-none">
      <Card.Header className="p-4 pb-2">
        <Card.Title className="text-base">{t('top-pages-title')}</Card.Title>
        <Card.Description>{t('top-pages-description')}</Card.Description>
      </Card.Header>
      <Card.Content className="p-4 pt-0">
        <RecordTable.Provider
          columns={columns}
          data={rows}
          stickyColumns={['page']}
          tableId="cms-analytics-top-pages"
        >
          <RecordTable.Scroll className="max-h-80">
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTable.Provider>
      </Card.Content>
    </Card>
  );
};
