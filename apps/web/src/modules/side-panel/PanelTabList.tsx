import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn, Tabs, useSortAccessibility } from 'erxes-ui';
import { usePointerSortSensors } from '~/lib/sortSensors';
import type { IRecordSidePanelTab } from './recordSidePanelTypes';
import { useRelationTabOrder } from './relationTabOrder';

/** One tab's trigger; a plugin's relation tab drags. Full row height, so the underline lands on the row's border. */
const PanelTabTrigger = ({
  tab,
  sidebar,
  compact,
  expanded,
}: {
  tab: IRecordSidePanelTab;
  sidebar: boolean;
  compact: boolean;
  expanded: boolean;
}) => {
  const { isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: tab.value,
    disabled: !tab.sortable,
  });

  return (
    // The drag moves this wrapper (a grid, so the trigger fills it), and only the pointer
    // listeners: the trigger keeps its tab role, arrow keys and own transitions.
    <div
      ref={setNodeRef}
      {...listeners}
      className={cn('sortable grid', isDragging && 'relative z-10 bg-background')}
      style={{
        '--sortable-transform': CSS.Transform.toString(transform),
        '--sortable-transition': transition,
      }}
    >
      <Tabs.Trigger
        value={tab.value}
        data-panel-tab={tab.value}
        title={expanded ? tab.label : undefined}
        size="sm"
      >
        <tab.icon
          className={cn('size-4 shrink-0', compact && !sidebar && 'hidden')}
          aria-hidden="true"
        />
        <span className={sidebar ? 'sr-only sm:not-sr-only' : undefined}>{tab.label}</span>
      </Tabs.Trigger>
    </div>
  );
};

/**
 * The shown tabs. Plugin relation tabs drag among themselves; Detail, Properties and Activity
 * stay where core puts them. The order is the member's, on every record. The drag's live region
 * sits beside the tab list, as a tablist may only hold tabs.
 */
export const PanelTabList = ({
  label,
  tabs,
  sidebar,
  compact,
  expanded,
}: {
  label: string;
  tabs: IRecordSidePanelTab[];
  sidebar: boolean;
  compact: boolean;
  expanded: boolean;
}) => {
  const order = useRelationTabOrder();
  const sensors = usePointerSortSensors();
  const sortable = tabs.filter((tab) => tab.sortable).map((tab) => tab.value);

  const accessibility = useSortAccessibility(
    (id) => tabs.find((tab) => tab.value === id)?.label ?? String(id),
    { pointer: true },
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) order.move(sortable, String(active.id), String(over.id));
  };

  return (
    <DndContext
      accessibility={accessibility}
      autoScroll={false}
      collisionDetection={closestCenter}
      modifiers={[
        sidebar ? restrictToVerticalAxis : restrictToHorizontalAxis,
        restrictToParentElement,
      ]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sortable}
        strategy={sidebar ? verticalListSortingStrategy : horizontalListSortingStrategy}
      >
        <Tabs.List
          aria-label={label}
          variant={sidebar ? 'vertical' : 'flush'}
          className={cn('min-w-0', !sidebar && 'h-full')}
        >
          {tabs.map((tab) => (
            <PanelTabTrigger
              key={tab.value}
              tab={tab}
              sidebar={sidebar}
              compact={compact}
              expanded={expanded}
            />
          ))}
        </Tabs.List>
      </SortableContext>
    </DndContext>
  );
};
