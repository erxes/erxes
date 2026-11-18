import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconInbox } from '@tabler/icons-react';
import { cn, useSortAccessibility } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { usePointerSortSensors } from '~/lib/sortSensors';
import { CORE_INBOX, type Inbox, useInboxOrder } from './useNotifications';

const UnreadCount = ({ value, active }: { value: number; active?: boolean }) =>
  value > 0 ? (
    <span
      className={cn(
        'ml-auto rounded-full px-1.5 text-xs font-medium',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  ) : null;

const navLinkClassName = (active: boolean) =>
  cn(
    'flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-accent',
    active && 'bg-accent font-medium',
  );

interface InboxLinkProps {
  inbox: Inbox;
  active: boolean;
  unread: number;
  /** A drop ends with a click on the dragged link, which must not open it. */
  wasDragged: () => boolean;
}

/** One inbox's link, with its unread count. */
const InboxLink = ({ inbox, active, unread, wasDragged }: InboxLinkProps) => {
  const Icon = inbox.icon;

  return (
    <Link
      to={paths.notificationSource(inbox.source)}
      className={navLinkClassName(active)}
      onClick={(event) => {
        if (wasDragged()) event.preventDefault();
      }}
    >
      <Icon className="size-4 text-primary-text" />
      <span className="truncate">{inbox.label}</span>
      <UnreadCount value={unread} active={active} />
    </Link>
  );
};

/**
 * A plugin's inbox. The drag moves a wrapper with only the pointer listeners, so the link stays
 * the one control (no button around it) and keeps its keys.
 */
const SortableInboxLink = (props: InboxLinkProps) => {
  const { isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.inbox.source,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      className={cn('sortable rounded-md', isDragging && 'relative z-10 bg-accent shadow-sm')}
      style={{
        '--sortable-transform': CSS.Transform.toString(transform),
        '--sortable-transition': transition,
      }}
    >
      <InboxLink {...props} />
    </div>
  );
};

/** All inboxes, then one per source with its unread count; drag a plugin's to reorder. */
export const InboxNav = ({
  inboxes,
  source,
  count,
  bySource,
}: {
  inboxes: Inbox[];
  source?: string;
  count: number;
  bySource: Record<string, number>;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const order = useInboxOrder();
  const sensors = usePointerSortSensors();
  const dragging = useRef(false);
  const plugins = inboxes.filter((inbox) => inbox.source !== CORE_INBOX).map((i) => i.source);

  const accessibility = useSortAccessibility(
    (id) => inboxes.find((inbox) => inbox.source === id)?.label ?? String(id),
    { pointer: true },
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over) order.move(plugins, String(active.id), String(over.id));
  };

  return (
    <nav
      className="flex w-56 shrink-0 flex-col gap-0.5 border-r bg-sidebar p-2"
      aria-label={t('inboxes', 'Inboxes')}
    >
      <Link to={paths.notifications} className={navLinkClassName(!source)}>
        <IconInbox className="size-4 text-muted-foreground" />
        {t('all-inboxes', 'All inboxes')}
        <UnreadCount value={count} active={!source} />
      </Link>
      <p className="px-2 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">
        {t('inboxes', 'Inboxes')}
      </p>
      <DndContext
        accessibility={accessibility}
        autoScroll={false}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        sensors={sensors}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={plugins} strategy={verticalListSortingStrategy}>
          {/* A drag stays marked until the next press, so the click its drop makes opens nothing. */}
          <div
            className="flex flex-col gap-0.5"
            onPointerDownCapture={() => {
              dragging.current = false;
            }}
          >
            {inboxes.map((inbox) => {
              // erxes' own inbox stays first.
              const Row = inbox.source === CORE_INBOX ? InboxLink : SortableInboxLink;

              return (
                <Row
                  key={inbox.source}
                  inbox={inbox}
                  active={source === inbox.source}
                  unread={bySource[inbox.source] ?? 0}
                  wasDragged={() => dragging.current}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </nav>
  );
};
