import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button, cn } from 'erxes-ui';
import { IconGripVertical, IconStarFilled } from '@tabler/icons-react';

import { Link } from 'react-router-dom';
import { favoriteOrderState } from '@/navigation/states/favoriteOrderState';
import { moveAppTab } from '@/navigation/utils/appTabs';
import { sortNavigationActivitiesByOrder } from '@/navigation/utils/navigationActivityOrder';
import { useAtom } from 'jotai';
import { useFavorites } from '@/navigation/hooks/useFavorites';
import { useNavigationFavorite } from '@/navigation/hooks/useNavigationFavorite';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

const CoreTabFavoriteItem = ({
  breadcrumb,
  icon: Icon,
  name,
  path,
  onNavigate,
  wasDragged,
}: Readonly<{
  breadcrumb: string[];
  icon?: React.ElementType;
  name: string;
  path: string;
  onNavigate: () => void;
  // A drop ends with a click on the dragged link; that click must not open it.
  wasDragged: () => boolean;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { toggleFavorite } = useNavigationFavorite({ breadcrumb, path });
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: path });
  const label = breadcrumb.length > 1 ? breadcrumb.slice(1).join(' / ') : name;

  return (
    <div
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      className={cn(
        'group/favorite flex h-8 items-center rounded hover:bg-accent',
        isDragging && 'relative z-10 bg-accent opacity-80 shadow-sm',
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <Link
        className="flex h-8 min-w-0 flex-1 items-center gap-2 px-2 text-sm font-medium"
        to={`/${path.replace('_ui', '').replace(/^\/+/, '')}`}
        onClick={(event) => {
          if (wasDragged()) {
            event.preventDefault();
            return;
          }
          onNavigate();
        }}
      >
        {Icon && <Icon className="size-4 shrink-0" />}
        <span className="truncate">{label}</span>
        {breadcrumb.length > 1 && (
          <span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
            {breadcrumb[0]}
          </span>
        )}
      </Link>
      {/* Hover hint that the favorite can be dragged to reorder. */}
      <IconGripVertical
        aria-hidden
        className={cn(
          'size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/favorite:opacity-100',
          isDragging && 'opacity-100',
        )}
      />
      <Button
        aria-label={t('remove-from-favorites', 'Remove from favorites')}
        className="mr-1 size-6 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
        size="icon"
        type="button"
        variant="ghost"
        onClick={toggleFavorite}
      >
        <IconStarFilled className="size-3.5" />
      </Button>
    </div>
  );
};

/**
 * The user's favorites, as the first section of the app chooser. They are
 * dragged to set their order, which is kept like the apps' order.
 */
export const CoreTabFavoritesSection = ({
  onNavigate,
}: Readonly<{ onNavigate: () => void }>) => {
  const favorites = useFavorites();
  const [order, setOrder] = useAtom(favoriteOrderState);
  const dragging = useRef(false);
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
  );

  if (favorites.length === 0) {
    return null;
  }

  const sorted = sortNavigationActivitiesByOrder(
    favorites.map((favorite) => ({ ...favorite, id: favorite.path })),
    order,
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    // Cleared after the click the drop produces has been ignored.
    setTimeout(() => {
      dragging.current = false;
    });

    if (
      over &&
      active.id !== over.id &&
      typeof active.id === 'string' &&
      typeof over.id === 'string'
    ) {
      setOrder(
        moveAppTab(
          sorted.map(({ id }) => id),
          active.id,
          over.id,
        ),
      );
    }
  };

  return (
    <section className="flex flex-col gap-0.5 py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {t('favorites')}
      </h2>
      <DndContext
        autoScroll={false}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        sensors={sensors}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          dragging.current = false;
        }}
      >
        <SortableContext
          items={sorted.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-0.5">
            {sorted.map(({ id, ...item }) => (
              <CoreTabFavoriteItem
                key={id}
                {...item}
                onNavigate={onNavigate}
                wasDragged={() => dragging.current}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
};
