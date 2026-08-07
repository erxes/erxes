import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { useTicketDetailSheet } from '@/ticket/hooks/useTicketDetailSheet';
import {
  FocusSheet,
  ScrollArea,
  Tabs,
  useQueryState,
  Empty,
  Sheet,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FieldsInDetail, RelationWidgetSideTabs } from 'ui-modules';
import { TicketSidebar } from './TicketSidebar';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTicketCustomFieldEdit } from '@/ticket/hooks/useTicketCustomFieldEdit';

type TicketData = ReturnType<typeof useGetTicket>['ticket'];

const TicketNotFoundState = () => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      {t('ticket-not-found')}
    </div>
  );
};

const TicketErrorState = ({ message }: { message?: string }) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex items-center justify-center h-full">
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconAlertCircle />
          </Empty.Media>
          <Empty.Title>{t('error')}</Empty.Title>
          <Empty.Description>{message}</Empty.Description>
        </Empty.Header>
      </Empty>
    </div>
  );
};

const TicketDetailTabs = ({
  activeTicket,
  ticket,
  selectedTab,
  setSelectedTab,
}: {
  activeTicket: string | null;
  ticket: TicketData;
  selectedTab: string | null;
  setSelectedTab: (value: string | null) => void;
}) => (
  <ScrollArea>
    <Tabs value={selectedTab ?? 'overview'} onValueChange={setSelectedTab}>
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
);

const TicketDetailBody = ({
  activeTicket,
  ticket,
  selectedTab,
  setSelectedTab,
  hideRelationWidgetSideTabs,
}: {
  activeTicket: string | null;
  ticket: TicketData;
  selectedTab: string | null;
  setSelectedTab: (value: string | null) => void;
  hideRelationWidgetSideTabs: boolean;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <>
      <FocusSheet.Header title={t('ticket-detail')} />
      <FocusSheet.Content>
        <Sheet.Title className="sr-only">
          {t('ticket-detail')} {ticket?.name}
        </Sheet.Title>
        <FocusSheet.SideBar>
          <TicketSidebar />
        </FocusSheet.SideBar>
        <div className="flex-auto flex">
          <TicketDetailTabs
            activeTicket={activeTicket}
            ticket={ticket}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />
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
    </>
  );
};

export const TicketDetailSheet = ({
  hideRelationWidgetSideTabs = false,
}: {
  hideRelationWidgetSideTabs?: boolean;
}) => {
  const [activeTicket, setActiveTicket] = useTicketDetailSheet();
  const { ticket, loading, error } = useGetTicket({
    variables: { _id: activeTicket },
    skip: !activeTicket,
  });
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  return (
    <FocusSheet
      open={Boolean(activeTicket)}
      onOpenChange={() => setActiveTicket(null)}
    >
      <FocusSheet.View
        loading={loading}
        error={Boolean(error)}
        notFound={!loading && !ticket}
        notFoundState={<TicketNotFoundState />}
        errorState={<TicketErrorState message={error?.message} />}
      >
        <TicketDetailBody
          activeTicket={activeTicket}
          ticket={ticket}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          hideRelationWidgetSideTabs={hideRelationWidgetSideTabs}
        />
      </FocusSheet.View>
    </FocusSheet>
  );
};
