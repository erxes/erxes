import { Breadcrumb, Button, PageContainer } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { IconTicket } from '@tabler/icons-react';
import { TicketsBoard } from '@/ticket/components/TicketsBoard';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';
const TicketsIndexPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1 ">
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
        <PageHeader.End>
          <AddTicketSheet />
        </PageHeader.End>
      </PageHeader>
      {/* <PageSubHeader></PageSubHeader> */}
      <TicketsBoard />
      <TicketDetailSheet />
    </PageContainer>
  );
};

export default TicketsIndexPage;
