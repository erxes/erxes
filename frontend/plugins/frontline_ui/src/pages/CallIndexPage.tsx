import { CallQueueRecordTable } from '@/integrations/call/components/CallQueueRecordTable';
import { IconPhone } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const CallIndexPage = () => {
  const { t } = useTranslation('frontline');
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
        </PageHeader.Start>
      </PageHeader>
      <CallQueueRecordTable />
    </PageContainer>
  );
};
