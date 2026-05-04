import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconLayoutKanban,
  IconTable,
} from '@tabler/icons-react';
import { useAtom, useAtomValue } from 'jotai';
import { ticketViewAtom } from '@/ticket/states/ticketViewState';
import { lazy, Suspense, useState } from 'react';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';

const TicketsRecordTable = lazy(() =>
  import('@/ticket/components/TicketsRecordTable').then((mod) => ({
    default: mod.TicketsRecordTable,
  })),
);

const TicketsBoard = lazy(() =>
  import('@/ticket/components/TicketsBoard').then((mod) => ({
    default: mod.TicketsBoard,
  })),
);

export const TicketsViewControl = () => {
  const [view, setView] = useAtom(ticketViewAtom);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          View
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          defaultValue="list"
          className="grid grid-cols-2 gap-2"
          value={view}
          onValueChange={(value) => {
            setView(value as 'list' | 'grid');
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="list" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0"
            >
              <IconTable className="!size-5" />
              <span className="text-xs font-normal">List</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="grid" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0"
            >
              <IconLayoutKanban className="!size-5" />
              <span className="text-xs font-normal">Board</span>
            </Button>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};

export const TicketsView = () => {
  const view = useAtomValue(ticketViewAtom);

  return (
    <Suspense>
      {view === 'list' ? <TicketsRecordTable /> : <TicketsBoard />}
      <TicketDetailSheet />
    </Suspense>
  );
};
