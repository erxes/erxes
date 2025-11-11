import { TicketDetails } from '@/ticket/components/ticket-detail/TicketDetails';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { ticketDetailSheetState } from '@/ticket/states/ticketDetailSheetState';
import {
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
} from '@tabler/icons-react';
import { Button, Separator, Sheet, TextOverflowTooltip } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';

export const TicketDetailSheet = () => {
  const [activeTicket, setActiveTicket] = useAtom(ticketDetailSheetState);
  const [isExpanded, setIsExpanded] = useState(true);
  return (
    <Sheet open={!!activeTicket} onOpenChange={() => setActiveTicket(null)}>
      <Sheet.View
        className={
          isExpanded ? 'min-w-[calc(100vw-1rem)] ' : 'sm:max-w-screen-md'
        }
      >
        <Sheet.Title className="sr-only">Ticket Details</Sheet.Title>
        {activeTicket && (
          <>
            <Sheet.Header>
              <TicketDetailSheetHeader
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
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

export const TicketDetailSheetHeader = ({
  isExpanded,
  setIsExpanded,
}: {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}) => {
  const activeTicket = useAtomValue(ticketDetailSheetState);
  const { ticket } = useGetTicket({ variables: { _id: activeTicket } });

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <IconArrowsDiagonalMinimize2 className="text-accent-foreground" />
        ) : (
          <IconArrowsDiagonal className="text-accent-foreground" />
        )}
      </Button>
      <Separator.Inline />
      <Sheet.Title className="lg:max-w-xl max-w-[18rem] sm:max-w-sm truncate">
        <TextOverflowTooltip value={ticket?.name} />
      </Sheet.Title>
    </div>
  );
};
