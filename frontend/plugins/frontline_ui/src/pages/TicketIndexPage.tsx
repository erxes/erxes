import { Breadcrumb, Button, PageContainer, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { IconTicket, IconPlus } from '@tabler/icons-react';
import { KanbanView } from '@/ticket/components/KanbanView';

const TicketsIndexPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/tickets">
                    <IconTicket />
                    Tickets
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <PageSubHeader>
        <div className="flex items-center gap-2">
          <Button variant="secondary">
            <IconPlus />
            New ticket
          </Button>
        </div>
      </PageSubHeader>
      <KanbanView />
    </PageContainer>
  );
};

export default TicketsIndexPage;
