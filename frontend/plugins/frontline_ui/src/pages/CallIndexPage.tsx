import { CallQueueRecordTable } from '@/integrations/call/components/CallQueuRecordTable';
import { IconPhone } from '@tabler/icons-react';
import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';

export const CallIndexPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/calls">
                    <IconPhone />
                    Calls
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
