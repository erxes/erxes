import { Card, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CmsAnalyticsTopPage } from '../types';
import {
  formatAnalyticsDuration,
  formatAnalyticsNumber,
} from '../utils/formatAnalytics';

type AnalyticsTopPagesTableProps = {
  pages: CmsAnalyticsTopPage[];
};

export const AnalyticsTopPagesTable = ({
  pages,
}: AnalyticsTopPagesTableProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'cms.analytics',
  });

  return (
    <Card className="rounded-lg border shadow-none">
      <Card.Header className="p-4 pb-2">
        <Card.Title className="text-base">{t('top-pages-title')}</Card.Title>
        <Card.Description>{t('top-pages-description')}</Card.Description>
      </Card.Header>
      <Card.Content className="p-0">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('table.page')}</Table.Head>
              <Table.Head className="w-28 text-right">
                {t('table.views')}
              </Table.Head>
              <Table.Head className="w-28 text-right">
                {t('table.users')}
              </Table.Head>
              <Table.Head className="w-32 text-right">
                {t('table.engagement')}
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {pages.map((page) => (
              <Table.Row key={`${page.pagePath}:${page.pageTitle || ''}`}>
                <Table.Cell>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {page.pageTitle || page.pagePath}
                    </div>
                    {page.pageTitle ? (
                      <div className="truncate font-mono text-xs text-muted-foreground">
                        {page.pagePath}
                      </div>
                    ) : null}
                  </div>
                </Table.Cell>
                <Table.Cell className="text-right tabular-nums">
                  {formatAnalyticsNumber(page.screenPageViews)}
                </Table.Cell>
                <Table.Cell className="text-right tabular-nums">
                  {formatAnalyticsNumber(page.activeUsers)}
                </Table.Cell>
                <Table.Cell className="text-right tabular-nums">
                  {formatAnalyticsDuration(page.averageEngagementTime)}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card.Content>
    </Card>
  );
};
