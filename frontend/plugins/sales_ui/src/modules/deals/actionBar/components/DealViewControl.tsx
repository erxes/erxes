'use client';

import { Button, Popover, PopoverScoped, ToggleGroup } from 'erxes-ui';
import {
  IconAdjustmentsHorizontal,
  IconLayoutKanban,
  IconList,
} from '@tabler/icons-react';

import { dealsViewAtom } from '@/deals/states/dealsViewState';
import { useAtom, useAtomValue } from 'jotai';

import { lazy, Suspense, useState } from 'react';
const DealsBoard = lazy(() =>
  import('../../boards/components/DealsBoard').then((mod) => ({
    default: mod.DealsBoard,
  })),
);

const DealsRecordTable = lazy(() =>
  import('../../boards/components/DealsRecordTable').then((mod) => ({
    default: mod.DealsRecordTable,
  })),
);

export const DealsViewControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useAtom(dealsViewAtom);

  return (
    <PopoverScoped open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <IconAdjustmentsHorizontal />
          Display
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <ToggleGroup
          type="single"
          defaultValue={view}
          className="grid grid-cols-2 gap-2"
          value={view}
          onValueChange={(value) => {
            setView(value as 'list' | 'board');
            setIsOpen(false);
          }}
        >
          <ToggleGroup.Item value="list" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0 border"
            >
              <IconList className="size-5!" />
              <span className="text-xs font-normal">List</span>
            </Button>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="board" asChild>
            <Button
              variant="secondary"
              size="lg"
              className="h-11 flex-col gap-0 border"
            >
              <IconLayoutKanban className="size-5!" />
              <span className="text-xs font-normal">Board</span>
            </Button>
          </ToggleGroup.Item>
        </ToggleGroup>
      </Popover.Content>
    </PopoverScoped>
  );
};

export const DealsView = () => {
  const view = useAtomValue(dealsViewAtom);

  return (
    <Suspense>
      {view === 'list' ? <DealsRecordTable /> : <DealsBoard />}
    </Suspense>
  );
};
