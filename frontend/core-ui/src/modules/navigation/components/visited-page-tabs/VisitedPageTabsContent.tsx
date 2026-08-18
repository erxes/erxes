import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable';
import { ScrollArea, Tabs } from 'erxes-ui';
import type { ComponentProps, ReactNode } from 'react';

const VisitedPageTabsList = ({
  children,
  items,
  trailingAction,
}: Readonly<{
  children: ReactNode;
  items: string[];
  trailingAction: ReactNode;
}>) => (
  <ScrollArea.Root className="group/tabs-scroll h-10 w-full" type="auto">
    <ScrollArea.Viewport className="h-10 w-full">
      <Tabs.List
        variant="segment"
        className="flex h-10 w-max min-w-full items-center justify-start gap-1 rounded-none bg-transparent px-0 group-has-data-[state=visible]/tabs-scroll:pb-1"
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          {children}
        </SortableContext>
        {trailingAction}
      </Tabs.List>
    </ScrollArea.Viewport>
    <ScrollArea.Bar
      className="z-10 h-1.5 border-0 bg-transparent p-0 opacity-60 transition-opacity group-hover/tabs-scroll:opacity-100 hover:opacity-100"
      orientation="horizontal"
    />
  </ScrollArea.Root>
);

export const VisitedPageTabsContent = ({
  activeTabId,
  children,
  items,
  onDragEnd,
  onValueChange,
  sensors,
  trailingAction,
}: Readonly<{
  activeTabId: string | null;
  children: ReactNode;
  items: string[];
  onDragEnd: (event: DragEndEvent) => void;
  onValueChange: (tabId: string) => void;
  sensors: ComponentProps<typeof DndContext>['sensors'];
  trailingAction: ReactNode;
}>) => (
  <DndContext
    autoScroll={false}
    collisionDetection={closestCenter}
    modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
    onDragEnd={onDragEnd}
    sensors={sensors}
  >
    <Tabs
      value={activeTabId ?? ''}
      onValueChange={onValueChange}
      className="min-w-0 flex-1 overflow-hidden"
    >
      <VisitedPageTabsList items={items} trailingAction={trailingAction}>
        {children}
      </VisitedPageTabsList>
    </Tabs>
  </DndContext>
);
