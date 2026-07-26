import {
  Breadcrumb,
  Button,
  PageContainer,
  PageSubHeader,
  Separator,
  Skeleton,
  useQueryState,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { Can, PageHeader, Import, createFavoriteBreadcrumb } from 'ui-modules';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { IconTicket } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import {
  TicketsViewControl,
  TicketsView,
} from '@/ticket/components/TicketsView';
import { TicketsSortControl } from '@/ticket/components/TicketsSortControl';
import { TicketsFilter } from '@/ticket/components/TicketsFilter';
import { TicketPageEffect } from '@/ticket/components/TicketPageEffect';
import { useTicketsVariables } from '@/ticket/hooks/useGetTickets';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';

const TicketsIndexPage = () => {
  const { t } = useTranslation('frontline');
  const variables = useTicketsVariables();
  const [channelId] = useQueryState<string | null>('channelId');
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const { channels } = useGetChannels();
  const { pipeline } = useGetPipeline(pipelineId || undefined);
  const channel = channels?.find(({ _id }) => _id === channelId);
  const isFavoriteBreadcrumbReady =
    (!channelId || Boolean(channel)) && (!pipelineId || Boolean(pipeline));
  const favoriteBreadcrumb = isFavoriteBreadcrumbReady
    ? createFavoriteBreadcrumb(channel?.name, pipeline?.name, t('tickets'))
    : [];

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
                    {t('tickets')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          {isFavoriteBreadcrumbReady ? (
            <PageHeader.FavoriteToggleButton
              breadcrumb={favoriteBreadcrumb}
              icon="IconTicket"
            />
          ) : (
            <Skeleton className="h-8 w-8" />
          )}
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
