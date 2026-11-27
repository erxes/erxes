import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, Popover, ScrollArea, cn } from 'erxes-ui';
import { IconApps, IconGridDots, IconGripVertical } from '@tabler/icons-react';

import {
  CoreTabTooltip,
  useCoreTabSide,
} from '@/navigation/components/core-tab/CoreTabTooltip';
import { CoreTabFavoritesSection } from '@/navigation/components/core-tab/CoreTabFavorites';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { navigationActivityOrderState } from '@/navigation/states/navigationActivityOrderState';
import { moveAppTab } from '@/navigation/utils/appTabs';
import { coreTabIconClassName } from '@/navigation/utils/coreTabClassName';
import { sortNavigationActivitiesByOrder } from '@/navigation/utils/navigationActivityOrder';
import { splitPromotedNavigationActivities } from '@/navigation/utils/promotedNavigationActivities';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CoreTabAppSwitcherItem = ({
  activity,
  active,
  onSelect,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  onSelect: (activity: INavigationActivity) => void;
}>) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id });
  const Icon = activity.icon || IconApps;

  return (
    <Button
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group/app h-9 min-w-0 justify-start gap-2.5 rounded-lg pr-1.5 pl-2 text-sm font-medium transition-[background-color,color,transform,box-shadow] duration-150 hover:bg-accent/80 active:scale-[0.98]',
        active &&
          'bg-primary/10 text-primary ring-1 ring-primary/15 hover:bg-primary/15 hover:text-primary',
        isDragging && 'relative z-10 bg-accent opacity-80 shadow-sm',
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      onClick={() => onSelect(activity)}
      type="button"
      variant="ghost"
    >
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md bg-muted/80 text-muted-foreground transition-[background-color,color,transform] duration-150 group-hover/app:scale-105 group-hover/app:bg-primary/12 group-hover/app:text-primary',
          active && 'bg-primary/15 text-primary',
        )}
      >
        <Icon className="size-3.5 shrink-0" />
      </span>
      <span className="flex-1 truncate text-left">{activity.label}</span>
      <IconGripVertical
        aria-hidden
        className={cn(
          'size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/app:opacity-100',
          isDragging && 'opacity-100',
        )}
      />
    </Button>
  );
};

const CoreTabAppSwitcherGroup = ({
  activeActivityId,
  activities,
  label,
  onMove,
  onSelect,
}: Readonly<{
  activeActivityId: string | null;
  activities: INavigationActivity[];
  label: string;
  onMove: (fromId: string, toId: string) => void;
  onSelect: (activity: INavigationActivity) => void;
}>) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
  );

  if (activities.length === 0) {
    return null;
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (
      over &&
      active.id !== over.id &&
      typeof active.id === 'string' &&
      typeof over.id === 'string'
    ) {
      onMove(active.id, over.id);
    }
  };

  return (
    <section className="py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h2>
      <DndContext
        autoScroll={false}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activities.map((activity) => activity.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 gap-0.5">
            {activities.map((activity) => (
              <CoreTabAppSwitcherItem
                key={activity.id}
                activity={activity}
                active={activity.id === activeActivityId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};

export const CoreTabAppSwitcher = ({
  activeActivityId,
  activities,
  onSelect,
}: Readonly<{
  activeActivityId: string | null;
  activities: INavigationActivity[];
  onSelect: (activity: INavigationActivity) => void;
}>) => {
  const [open, setOpen] = useState(false);
  const side = useCoreTabSide();
  const [order, setOrder] = useAtom(navigationActivityOrderState);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { promoted, rest } = splitPromotedNavigationActivities(
    activities.filter((activity) => activity.kind === 'plugin'),
  );
  const pluginActivities = sortNavigationActivitiesByOrder(
    [...promoted, ...rest],
    order,
  );
  const coreActivities = sortNavigationActivitiesByOrder(
    activities.filter((activity) => activity.kind === 'core'),
    order,
  );

  const moveActivity = (fromId: string, toId: string) =>
    setOrder(
      moveAppTab(
        [...pluginActivities, ...coreActivities].map(({ id }) => id),
        fromId,
        toId,
      ),
    );

  const handleSelect = (activity: INavigationActivity) => {
    onSelect(activity);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CoreTabTooltip label={t('open-plugin')}>
        <Popover.Trigger asChild>
          <Button
            aria-label={t('open-plugin')}
            className={coreTabIconClassName(open)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <IconGridDots className="size-4" />
          </Button>
        </Popover.Trigger>
      </CoreTabTooltip>
      <Popover.Content
        align="start"
        className="flex max-h-[var(--radix-popover-content-available-height)] w-80 flex-col overflow-hidden rounded-xl border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur-md"
        side={side}
        sideOffset={8}
      >
        <ScrollArea
          className="min-h-0 flex-auto"
          viewportClassName="[&>div]:block! [&>div]:min-w-0"
        >
          <CoreTabFavoritesSection onNavigate={() => setOpen(false)} />
          <CoreTabAppSwitcherGroup
            activeActivityId={activeActivityId}
            activities={pluginActivities}
            label={t('plugins')}
            onMove={moveActivity}
            onSelect={handleSelect}
          />
          <CoreTabAppSwitcherGroup
            activeActivityId={activeActivityId}
            activities={coreActivities}
            label={t('core-modules')}
            onMove={moveActivity}
            onSelect={handleSelect}
          />
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};
