import { Breadcrumb, Button, PageContainer, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { PageHeader, Import } from 'ui-modules';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { IconTicket } from '@tabler/icons-react';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import {
  TicketsViewControl,
  TicketsView,
} from '@/ticket/components/TicketsView';
import { TicketsFilter } from '@/ticket/components/TicketsFilter';
import { TicketPageEffect } from '@/ticket/components/TicketPageEffect';
import { useTicketsVariables } from '@/ticket/hooks/useGetTickets';

const TicketsIndexPage = () => {
  const variables = useTicketsVariables();

  const getFilters = () => {
    const { cursor, limit, orderBy, ...filters } = variables;
    return filters;
  };

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
        <Import
          pluginName="frontline"
          moduleName="ticket"
          collectionName="ticket"
        />
        <Export
          pluginName="frontline"
          moduleName="ticket"
          collectionName="ticket"
          getFilters={getFilters}
        />
        <TicketsViewControl />
      </PageSubHeader>
      <TicketsView />
      <TicketPageEffect />
    </PageContainer>
  );
};

export default TicketsIndexPage;
