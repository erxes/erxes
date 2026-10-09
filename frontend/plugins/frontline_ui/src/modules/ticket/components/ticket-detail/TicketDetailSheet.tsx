import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { useTicketRemove } from '@/ticket/hooks/useRemoveTicket';
import { useToggleTicketArchive } from '@/ticket/hooks/useToggleTicketArchive';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useTicketDetailSheet } from '@/ticket/hooks/useTicketDetailSheet';
import {
  Button,
  DropdownMenu,
  FocusSheet,
  ScrollArea,
  Tabs,
  useConfirm,
  useQueryState,
  useToast,
  Empty,
  Sheet,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { RelationWidgetSideTabs } from 'ui-modules';
import { TicketSidebar } from './TicketSidebar';
import {
  IconAlertCircle,
  IconBell,
  IconBellOff,
  IconDotsVertical,
  IconSquareToggle,
  IconTrash,
} from '@tabler/icons-react';
import { useTicketCustomFieldEdit } from '@/ticket/hooks/useTicketCustomFieldEdit';
import { TicketPipelineProperties } from './TicketPipelineProperties';

export const TicketDetailSheet = ({
  hideRelationWidgetSideTabs = false,
}: {
  hideRelationWidgetSideTabs?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [activeTicket, setActiveTicket] = useTicketDetailSheet();
  const { ticket, loading, error } = useGetTicket({
    variables: { _id: activeTicket },
    skip: !activeTicket,
  });
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { updateTicket } = useUpdateTicket();
  const { removeTicket } = useTicketRemove();
  const { toggleArchive } = useToggleTicketArchive();
  const isArchived = ticket?.state === 'archived';
  const isSubscribed = Boolean(ticket?.isSubscribed);

  const handleArchiveToggle = () => {
    if (!ticket) return;
    toggleArchive([ticket._id], isArchived).catch(() => undefined);
  };

  const handleSubscribeToggle = () => {
    if (!ticket) return;
    updateTicket({
      variables: { _id: ticket._id, isSubscribed: !isSubscribed },
      onCompleted: () => {
        toast({
          title: t('success', 'Success!'),
          variant: 'success',
          description: isSubscribed
            ? t('ticket-unsubscribed', 'Unsubscribed from ticket')
            : t('ticket-subscribed', 'Subscribed to ticket'),
        });
      },
    }).catch(() => undefined);
  };

  const handleDeleteTicket = () => {
    if (!ticket) return;
    confirm({
      message: t(
        'confirm-delete-ticket',
        'Are you sure you want to delete this ticket?',
      ),
    })
      .then(async () => {
        try {
          await removeTicket([ticket._id]);
          toast({
            title: t('success', 'Success!'),
            variant: 'success',
            description: t(
              'ticket-deleted-successfully',
              'Ticket deleted successfully',
            ),
          });
        } catch (e) {
          toast({
            title: t('error', 'Error'),
            description: e instanceof Error ? e.message : String(e),
            variant: 'destructive',
          });
        }
      })
      .catch(() => undefined);
  };

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
        <Sheet.Header className="gap-2 pr-0">
          <FocusSheet.SidebarTrigger />
          <div className="flex flex-col">
            <Sheet.Title>{t('ticket-detail', 'Ticket Detail')}</Sheet.Title>
            <Sheet.Description className="sr-only">
              {t('ticket-detail', 'Ticket Detail')}
            </Sheet.Description>
          </div>
          <div className="flex flex-1 justify-end">
            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="outline">
                  <IconDotsVertical />
                  {t('actions', 'Actions')}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" className="w-48 min-w-fit!">
                <DropdownMenu.Item onSelect={handleArchiveToggle}>
                  <IconSquareToggle />
                  {isArchived
                    ? t('unarchive', 'Unarchive')
                    : t('archive', 'Archive')}
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={handleSubscribeToggle}>
                  {isSubscribed ? <IconBellOff /> : <IconBell />}
                  {isSubscribed
                    ? t('unsubscribe', 'UnSubscribe')
                    : t('subscribe', 'Subscribe')}
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item
                  onSelect={handleDeleteTicket}
                  className="text-destructive"
                >
                  <IconTrash />
                  {t('delete', 'Delete')}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
          <div className="w-16 self-stretch shrink-0 border-l bg-sidebar flex items-center justify-center">
            <Sheet.Close className="ml-0" />
          </div>
        </Sheet.Header>
        <FocusSheet.Content>
          <Sheet.Title className="sr-only">
            {t('ticket-detail', 'Ticket Detail')} {ticket?.name}
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
                  <TicketPipelineProperties
                    pipelineId={ticket?.pipelineId || ''}
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
