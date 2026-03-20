import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { ticketDetailSheetState } from '@/ticket/states/ticketDetailSheetState';
import {
  FocusSheet,
  ScrollArea,
  Tabs,
  useQueryState,
  Empty,
  Sheet,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { FieldsInDetail, RelationWidgetSideTabs } from 'ui-modules';
import { TicketSidebar } from './TicketSidebar';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTicketCustomFieldEdit } from '@/ticket/hooks/useTicketCustomFieldEdit';

export const TicketDetailSheet = ({
  hideRelationWidgetSideTabs = false,
}: {
  hideRelationWidgetSideTabs?: boolean;
}) => {
  const [activeTicket, setActiveTicket] = useAtom(ticketDetailSheetState);
  const { ticket, loading, error } = useGetTicket({
    variables: { _id: activeTicket },
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
        notFoundState={<div>Ticket not found</div>}
        errorState={
          <div className="flex items-center justify-center h-full">
            <Empty>
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconAlertCircle />
                </Empty.Media>
                <Empty.Title>Error</Empty.Title>
                <Empty.Description>{error?.message}</Empty.Description>
              </Empty.Header>
            </Empty>
          </div>
        }
      >
        <FocusSheet.Header title="Ticket Detail" />
        <FocusSheet.Content>
          <Sheet.Title className="sr-only">
            Ticket detail {ticket?.name}
          </Sheet.Title>
          <FocusSheet.SideBar>
            <TicketSidebar />
          </FocusSheet.SideBar>
          <div className="flex-auto flex">
            <ScrollArea>
              <Tabs
                value={selectedTab ?? 'overview'}
                onValueChange={setSelectedTab}
              >
                <Tabs.Content value="overview">
                  {activeTicket && <TicketDetails ticketId={activeTicket} />}
                </Tabs.Content>

                <Tabs.Content value="properties" className="p-6">
                  <FieldsInDetail
                    fieldContentType="frontline:ticket"
                    propertiesData={ticket?.propertiesData || {}}
                    mutateHook={useTicketCustomFieldEdit}
                    id={ticket?._id || ''}
                  />
                </Tabs.Content>
              </Tabs>
            </ScrollArea>
          </div>
          {!hideRelationWidgetSideTabs && (
            <RelationWidgetSideTabs
              contentId={activeTicket || ''}
              contentType="frontline:ticket"
              hookOptions={{
                hiddenModules: ['ticket'],
              }}
            />
          )}
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
