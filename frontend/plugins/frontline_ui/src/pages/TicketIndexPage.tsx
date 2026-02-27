import { Breadcrumb, Button, PageContainer, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { FavoriteToggleIconButton, PageHeader } from 'ui-modules';
import { IconTicket } from '@tabler/icons-react';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import {
  TicketsViewControl,
  TicketsView,
} from '@/ticket/components/TicketsView';
import { TicketsFilter } from '@/ticket/components/TicketsFilter';
import { TicketPageEffect } from '@/ticket/components/TicketPageEffect';
const TicketsIndexPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1 ">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/frontline/tickets">
                    <IconTicket />
                    Tickets
                  </Link>
                </Button>
                <FavoriteToggleIconButton />
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <AddTicketSheet />
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader>
        <TicketsFilter />
        <TicketsViewControl />
      </PageSubHeader>
      <TicketsView />
      <TicketPageEffect />
    </PageContainer>
  );
};

export default TicketsIndexPage;
