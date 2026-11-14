import { ActivityList } from '@/activity/components/ActivityList';
import { isRecord } from '@/shared/utils/isRecord';
import { TicketDetailActions } from '@/ticket/components/ticket-detail/TicketDetailActions';
import { TicketPipelineProperties } from '@/ticket/components/ticket-detail/TicketPipelineProperties';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { useTicketCustomFieldEdit } from '@/ticket/hooks/useTicketCustomFieldEdit';
import { ticketRemovedIdsState } from '@/ticket/states/removedTicketsState';
import {
  IconAlignLeft,
  IconHierarchy2,
  IconHistory,
  IconInfoCircle,
  IconListDetails,
  IconTicket,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Empty,
  PageContainer,
  ScrollArea,
  Separator,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { currentUserState, PageHeader, RecordSidePanel } from 'ui-modules';
import {
  TicketPageDescription,
  TicketPageFields,
  TicketPanelName,
} from '~/widgets/record-panel/TicketPanelDetail';

const FIELDS_TAB = 'fields';
const DESCRIPTION_TAB = 'description';
const PROPERTIES_TAB = 'properties';
const ACTIVITY_TAB = 'activity';
const TICKETS_PATH = '/frontline/tickets';

export const TicketDetailPage = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const { t: tPanel } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { ticketId = '' } = useParams<{ ticketId: string }>();
  const [tab, setTab] = useQueryState<string>('tab');
  const navigate = useNavigate();
  const removed = useAtomValue(ticketRemovedIdsState);
  const userId = useAtomValue(currentUserState)?._id;
  const { ticket, loading, error } = useGetTicket({
    variables: { _id: ticketId },
    skip: !ticketId,
  });

  useEffect(() => {
    if (removed.userId === userId && removed.ids.includes(ticketId)) {
      navigate(TICKETS_PATH, { replace: true });
    }
  }, [removed, userId, ticketId, navigate]);

  const renderBody = () => {
    if (loading && !ticket) {
      return <Spinner containerClassName="py-12" />;
    }

    if (!ticket) {
      return (
        <div className="flex flex-1 items-center justify-center p-6">
          <Empty>
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconInfoCircle />
              </Empty.Media>
              <Empty.Title>
                {error ? t('failed-to-load-ticket') : t('ticket-not-found')}
              </Empty.Title>
              <Empty.Description>
                {error?.message || t('ticket-no-longer-available')}
              </Empty.Description>
            </Empty.Header>
          </Empty>
        </div>
      );
    }

    return (
      <RecordSidePanel.Tabs
        key={ticketId}
        value={tab ?? DESCRIPTION_TAB}
        onValueChange={setTab}
        visibleCount={3}
        overviewTab={FIELDS_TAB}
        expandedDefaultTab={DESCRIPTION_TAB}
        overviewHeader={
          <div className="min-w-0 flex-1 truncate text-sm">
            <TicketPanelName ticket={ticket} />
          </div>
        }
        tabs={[
          {
            value: FIELDS_TAB,
            label: tPanel('detail', 'Detail'),
            icon: IconListDetails,
            content: <TicketPageFields ticket={ticket} />,
          },
          {
            value: DESCRIPTION_TAB,
            label: t('description'),
            icon: IconAlignLeft,
            content: <TicketPageDescription ticket={ticket} />,
          },
          {
            value: PROPERTIES_TAB,
            label: tPanel('properties', 'Properties'),
            icon: IconHierarchy2,
            content: (
              <ScrollArea
                className="flex-1 min-h-0"
                viewportClassName="[&>div]:block!"
              >
                <div className="p-3">
                  <TicketPipelineProperties
                    id={ticketId}
                    propertiesData={
                      isRecord(ticket.propertiesData)
                        ? ticket.propertiesData
                        : {}
                    }
                    mutateHook={useTicketCustomFieldEdit}
                  />
                </div>
              </ScrollArea>
            ),
          },
          {
            value: ACTIVITY_TAB,
            label: tPanel('activity', 'Activity'),
            icon: IconHistory,
            content: (
              <ScrollArea
                className="flex-1 min-h-0"
                viewportClassName="[&>div]:block!"
              >
                <div className="p-3">
                  <ActivityList
                    key={ticketId}
                    contentId={ticketId}
                    contentDetail={ticket}
                  />
                </div>
              </ScrollArea>
            ),
          },
        ]}
      />
    );
  };

  return (
    <PageContainer>
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <PageHeader>
          <PageHeader.Start className="flex-auto min-w-0">
            <Breadcrumb className="min-w-0">
              <Breadcrumb.List className="gap-1 flex-nowrap min-w-0">
                <Breadcrumb.Item className="shrink-0">
                  <Button variant="ghost" asChild>
                    <Link to={TICKETS_PATH}>
                      <IconTicket />
                      {t('tickets', { keyPrefix: '' })}
                    </Link>
                  </Button>
                </Breadcrumb.Item>
                <Separator.Inline />
                <Breadcrumb.Item className="min-w-0">
                  <Breadcrumb.Page className="block min-w-0 max-w-md truncate px-2 text-sm">
                    {ticket?.name || t('ticket-detail')}
                  </Breadcrumb.Page>
                </Breadcrumb.Item>
              </Breadcrumb.List>
            </Breadcrumb>
          </PageHeader.Start>
          {ticket && (
            <PageHeader.End>
              <TicketDetailActions ticket={ticket} />
            </PageHeader.End>
          )}
        </PageHeader>
        {renderBody()}
      </RecordSidePanel>
    </PageContainer>
  );
};
