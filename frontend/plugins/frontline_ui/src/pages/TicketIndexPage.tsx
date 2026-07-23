import { Breadcrumb, PageContainer, PageSubHeader } from 'erxes-ui';
import { Can, PageHeader, Import } from 'ui-modules';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import {
  TicketsViewControl,
  TicketsView,
} from '@/ticket/components/TicketsView';
import { TicketsSortControl } from '@/ticket/components/TicketsSortControl';
import { TicketsFilter } from '@/ticket/components/TicketsFilter';
import { TicketPageEffect } from '@/ticket/components/TicketPageEffect';
import { useTicketsVariables } from '@/ticket/hooks/useGetTickets';
import { TicketBreadcrumb } from '@/ticket/components/TicketBreadcrumb';

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
              <TicketBreadcrumb />
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <AddTicketSheet />
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader>
        <TicketsFilter />
        <Can action="ticketsImportManage">
          <Import
            pluginName="frontline"
            moduleName="ticket"
            collectionName="ticket"
          />
        </Can>
        <Can action="ticketsExportManage">
          <Export
            pluginName="frontline"
            moduleName="ticket"
            collectionName="ticket"
            getFilters={getFilters}
          />
        </Can>
        <div>
          <TicketsViewControl />
          <TicketsSortControl />
        </div>
      </PageSubHeader>
      <TicketsView />
      <TicketPageEffect />
    </PageContainer>
  );
};

export default TicketsIndexPage;
