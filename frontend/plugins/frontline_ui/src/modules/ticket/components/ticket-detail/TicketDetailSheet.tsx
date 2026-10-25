import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { useTicketDetailSheet } from '@/ticket/hooks/useTicketDetailSheet';
import {
  cn,
  FocusSheet,
  ScrollArea,
  Tabs,
  useQueryState,
  Empty,
  Sheet,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RelationWidgetSideTabs } from 'ui-modules';
import { TicketSidebar } from './TicketSidebar';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTicketCustomFieldEdit } from '@/ticket/hooks/useTicketCustomFieldEdit';
import { TicketPipelineProperties } from './TicketPipelineProperties';
import { TicketDetailActions } from './TicketDetailActions';
import { isRecord } from '@/shared/utils/isRecord';

export const TicketDetailSheet = ({
  hideRelationWidgetSideTabs = false,
}: {
  hideRelationWidgetSideTabs?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [activeTicket, setActiveTicket] = useTicketDetailSheet();
  const { ticket, loading, error } = useGetTicket({
    variables: activeTicket ? { _id: activeTicket } : undefined,
    skip: !activeTicket,
  });
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <FocusSheet
      open={!!activeTicket}
      onOpenChange={() => setActiveTicket(null)}
    >
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!ticket}
        notFoundState={<div>{t('ticket-not-found', 'Ticket not found')}</div>}
        errorState={
          <div className="flex items-center justify-center h-full">
            <Empty>
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconAlertCircle />
                </Empty.Media>
                <Empty.Title>{t('error', 'Error')}</Empty.Title>
                <Empty.Description>{error?.message}</Empty.Description>
              </Empty.Header>
            </Empty>
          </div>
        }
      >
        <Sheet.Header
          className={cn('gap-2', !hideRelationWidgetSideTabs && 'pr-0')}
        >
          <FocusSheet.SidebarTrigger />
          <div className="flex flex-col">
            <Sheet.Title>{t('ticket-detail', 'Ticket Detail')}</Sheet.Title>
            <Sheet.Description className="sr-only">
              {t('ticket-detail', 'Ticket Detail')}
            </Sheet.Description>
          </div>
          <div className="flex flex-1 justify-end">
            {ticket && <TicketDetailActions ticket={ticket} />}
          </div>
          {hideRelationWidgetSideTabs ? (
            <Sheet.Close className="ml-0" />
          ) : (
            <div className="w-16 self-stretch shrink-0 border-l bg-sidebar flex items-center justify-center">
              <Sheet.Close className="ml-0" />
            </div>
          )}
        </Sheet.Header>
        <FocusSheet.Content>
          <Sheet.Title className="sr-only">
            {t('ticket-detail', 'Ticket Detail')} {ticket?.name}
          </Sheet.Title>
          <FocusSheet.SideBar>
            <TicketSidebar />
          </FocusSheet.SideBar>
          <div className="flex-auto flex">
            <ScrollArea className="min-w-0 flex-1">
              <Tabs
                value={selectedTab ?? 'overview'}
                onValueChange={setSelectedTab}
              >
                <Tabs.Content value="overview">
                  {activeTicket && <TicketDetails ticketId={activeTicket} />}
                </Tabs.Content>

                <Tabs.Content value="properties" className="p-6">
                  <TicketPipelineProperties
                    propertiesData={
                      isRecord(ticket?.propertiesData)
                        ? ticket.propertiesData
                        : {}
                    }
                    mutateHook={useTicketCustomFieldEdit}
                    id={ticket?._id || ''}
                  />
                </Tabs.Content>
              </Tabs>
            </ScrollArea>
          </div>
          {!hideRelationWidgetSideTabs && (
            <RelationWidgetSideTabs
              customerId={ticket?.customerId}
              companyId={ticket?.companyId}
            />
          )}
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
