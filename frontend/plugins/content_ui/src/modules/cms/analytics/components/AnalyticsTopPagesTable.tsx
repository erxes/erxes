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
import {
  type AnalyticsTopPageCellProps,
  type AnalyticsTopPageColumnLabels,
  type AnalyticsTopPageMetricCellProps,
  type AnalyticsTopPagesTableHeadProps,
  type AnalyticsTopPagesTableProps,
  type CmsAnalyticsTopPageRow,
} from '../types';
import {
  formatAnalyticsDuration,
  formatAnalyticsNumber,
} from '../utils/formatAnalytics';

const AnalyticsTopPagesTableHead = ({
  icon,
  label,
}: AnalyticsTopPagesTableHeadProps) => (
  <RecordTable.InlineHead icon={icon} label={label} />
);

const AnalyticsTopPageNameCell = ({ page }: AnalyticsTopPageCellProps) => {
  const pageName = page.pageTitle?.trim() || page.pagePath;

  return (
    <RecordTableInlineCell>
      <TextOverflowTooltip
        value={pageName}
        className="text-sm font-semibold text-foreground"
      />
    </RecordTableInlineCell>
  );
};

const AnalyticsTopPageUrlCell = ({ page }: AnalyticsTopPageCellProps) => (
  <RecordTableInlineCell>
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-sm bg-muted px-1.5 py-0.5 text-muted-foreground">
      <IconLink className="size-3 flex-none text-muted-foreground/70" />
      <TextOverflowTooltip
        value={page.pagePath}
        className="min-w-0 font-mono text-[11px] leading-4"
      />
    </div>
  </RecordTableInlineCell>
);

const AnalyticsTopPageViewsCell = ({
  value,
}: AnalyticsTopPageMetricCellProps) => (
  <RecordTableInlineCell className="justify-end text-right font-medium tabular-nums">
    {formatAnalyticsNumber(value)}
  </RecordTableInlineCell>
);

const AnalyticsTopPageUsersCell = ({
  value,
}: AnalyticsTopPageMetricCellProps) => (
  <RecordTableInlineCell className="justify-end text-right tabular-nums">
    {formatAnalyticsNumber(value)}
  </RecordTableInlineCell>
);

const AnalyticsTopPageEngagementCell = ({
  value,
}: AnalyticsTopPageMetricCellProps) => (
  <RecordTableInlineCell className="justify-end text-right tabular-nums">
    {formatAnalyticsDuration(value)}
  </RecordTableInlineCell>
);

const getAnalyticsTopPageColumns = ({
  engagement,
  page,
  url,
  users,
  views,
}: AnalyticsTopPageColumnLabels): ColumnDef<CmsAnalyticsTopPageRow>[] => [
  {
    id: 'page',
    accessorKey: 'pagePath',
    header: () => (
      <AnalyticsTopPagesTableHead icon={IconFileAnalytics} label={page} />
    ),
    cell: ({ row }) => <AnalyticsTopPageNameCell page={row.original} />,
    size: 220,
  },
  {
    id: 'pageUrl',
    accessorKey: 'pagePath',
    header: () => <AnalyticsTopPagesTableHead icon={IconLink} label={url} />,
    cell: ({ row }) => <AnalyticsTopPageUrlCell page={row.original} />,
    size: 260,
  },
  {
    id: 'views',
    accessorKey: 'screenPageViews',
    header: () => <AnalyticsTopPagesTableHead icon={IconEye} label={views} />,
    cell: ({ row }) => (
      <AnalyticsTopPageViewsCell value={row.original.screenPageViews} />
    ),
    size: 84,
  },
  {
    id: 'users',
    accessorKey: 'activeUsers',
    header: () => <AnalyticsTopPagesTableHead icon={IconUsers} label={users} />,
    cell: ({ row }) => (
      <AnalyticsTopPageUsersCell value={row.original.activeUsers} />
    ),
    size: 84,
  },
  {
    id: 'engagement',
    accessorKey: 'averageEngagementTime',
    header: () => (
      <AnalyticsTopPagesTableHead icon={IconClock} label={engagement} />
    ),
    cell: ({ row }) => (
      <AnalyticsTopPageEngagementCell
        value={row.original.averageEngagementTime}
      />
    ),
    size: 112,
  },
];

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
    () =>
      getAnalyticsTopPageColumns({
        engagement: t('table.engagement'),
        page: t('table.page'),
        url: t('table.url'),
        users: t('table.users'),
        views: t('table.views'),
      }),
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
          stickyColumns={['page', 'pageUrl']}
          tableId="cms-analytics-top-pages-v3"
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
