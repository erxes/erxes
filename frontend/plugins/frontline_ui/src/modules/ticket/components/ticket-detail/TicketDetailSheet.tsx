import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { ticketDetailSheetState } from '@/ticket/states/ticketDetailSheetState';
import { IconArrowsDiagonal } from '@tabler/icons-react';
import { Button, Separator, Sheet, TextOverflowTooltip } from 'erxes-ui';
import { useAtom } from 'jotai';
import { Link, useParams } from 'react-router-dom';

export const TicketDetailSheet = () => {
  const [activeTicket, setActiveTicket] = useAtom(ticketDetailSheetState);

  return (
    <Sheet open={!!activeTicket} onOpenChange={() => setActiveTicket(null)}>
      <Sheet.View className="sm:max-w-screen-md">
        <Sheet.Title className="sr-only">Ticket Details</Sheet.Title>
        {activeTicket && (
          <>
            <Sheet.Header>
              <TicketDetailSheetHeader />
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="overflow-y-auto">
              <TicketDetails ticketId={activeTicket} />
            </Sheet.Content>
          </>
        )}
      </Sheet.View>
    </Sheet>
  );
};

export const TicketDetailSheetHeader = () => {
  const { teamId, projectId } = useParams();
  const [activeTicket, setActiveTicket] = useAtom(ticketDetailSheetState);
  const { ticket } = useGetTicket({ variables: { _id: activeTicket } });

  const url =
    teamId && !projectId
      ? `/operation/team/${teamId}/tickets/${activeTicket}`
      : `/operation/tickets/${activeTicket}`;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        asChild
        onClick={() => setActiveTicket(null)}
      >
        <Link to={url}>
          <IconArrowsDiagonal className="text-accent-foreground" />
        </Link>
      </Button>
      <Separator.Inline />
      <Sheet.Title className="lg:max-w-xl max-w-[18rem] sm:max-w-sm truncate">
        <TextOverflowTooltip value={ticket?.name} />
      </Sheet.Title>
    </div>
  );
};
