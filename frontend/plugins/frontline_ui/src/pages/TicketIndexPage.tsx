import {
  Breadcrumb,
  Button,
  Empty,
  PageContainer,
  PageSubHeader,
  Separator,
  Skeleton,
  useQueryState,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { Can, PageHeader, Import, createFavoriteBreadcrumb } from 'ui-modules';
import { Export } from 'ui-modules/modules/import-export/components/epxort/Export';
import { IconAlertCircle, IconTicket } from '@tabler/icons-react';
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
  const {
    channels,
    loading: channelsLoading,
    error: channelsError,
  } = useGetChannels();
  const {
    pipeline,
    loading: pipelineLoading,
    error: pipelineError,
  } = useGetPipeline(pipelineId || undefined);
  const channel = channels?.find(({ _id }) => _id === channelId);
  const isFavoriteBreadcrumbLoading =
    Boolean(channelId && channelsLoading) ||
    Boolean(pipelineId && pipelineLoading);
  const favoriteBreadcrumbError =
    (channelId ? channelsError : undefined) ||
    (pipelineId ? pipelineError : undefined);
  const favoriteBreadcrumb = createFavoriteBreadcrumb(
    channel?.name,
    pipeline?.name,
    t('tickets'),
  );

  const getFilters = () => {
    const { cursor, limit, orderBy, ...filters } = variables;
    return filters;
  };

  if (favoriteBreadcrumbError) {
    return (
      <PageContainer>
        <Empty className="m-3 rounded-lg bg-sidebar">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconAlertCircle />
            </Empty.Media>
            <Empty.Title>{t('error')}</Empty.Title>
            <Empty.Description>
              {favoriteBreadcrumbError.message}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </PageContainer>
    );
  }

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
          {isFavoriteBreadcrumbLoading ? (
            <Skeleton className="h-8 w-8" />
          ) : (
            <PageHeader.FavoriteToggleButton
              breadcrumb={favoriteBreadcrumb}
              icon="IconTicket"
            />
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
