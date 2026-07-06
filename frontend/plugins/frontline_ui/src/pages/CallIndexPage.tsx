import { CallQueueRecordTable } from '@/integrations/call/components/CallQueueRecordTable';
import { IconPhone } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer, Separator } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader, createFavoriteBreadcrumb } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const CallIndexPage = () => {
  const { t } = useTranslation('frontline');
  const favoriteBreadcrumb = createFavoriteBreadcrumb(t('queue-switchboard'));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/calls/dashboard">
                    <IconPhone />
                    {t('queue-switchboard')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/calls/statistics">
                    <IconPhone />
                    {t('queue-statistics')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton breadcrumb={favoriteBreadcrumb} />
        </PageHeader.Start>
      </PageHeader>
      <CallQueueRecordTable />
    </PageContainer>
  );
};
