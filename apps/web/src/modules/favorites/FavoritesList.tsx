import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Favorite } from '@erxes/core-contract';
import { IconStarFilled } from '@tabler/icons-react';
import { Button, cn, useSortList, useSortRoleDescription } from 'erxes-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSortSensors } from '~/lib/sortSensors';
import { useFavorites } from './useFavorites';

const FavoriteRow = ({
  favorite,
  onOpen,
  onRemove,
  wasDragged,
}: {
  favorite: Favorite;
  onOpen: () => void;
  onRemove: () => void;
  /** A drop ends with a click on the dragged link, which must not open it. */
  wasDragged: () => boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'favorites' });

  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: favorite.id,
    attributes: { roleDescription: useSortRoleDescription() },
  });

  return (
    <li
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'sortable flex h-8 min-w-0 items-center rounded hover:bg-accent',
        isDragging && 'z-10 bg-accent shadow-sm',
      )}
      style={{
        '--sortable-transform': CSS.Transform.toString(transform),
        '--sortable-transition': transition,
      }}
    >
      <Link
        to={favorite.path}
        title={favorite.label}
        className="flex h-8 min-w-0 flex-1 items-center px-2 text-sm font-medium"
        onClick={(event) => {
          if (wasDragged()) event.preventDefault();
          else onOpen();
        }}
      >
        <span className="truncate">{favorite.label}</span>
      </Link>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label={t('remove-named', {
          name: favorite.label,
          defaultValue: `Remove ${favorite.label} from favorites`,
        })}
        className="mr-1 size-6"
        onClick={onRemove}
      >
        <IconStarFilled className="size-3.5 text-warning" />
      </Button>
    </li>
  );
};

/** The member's favorites, drag to reorder; nothing when there are none. */
export const FavoritesList = ({ onOpen }: { onOpen: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'favorites' });
  const { favorites, remove, reorder } = useFavorites();
  const dragging = useRef(false);

  const sensors = useSortSensors();

  const sortList = useSortList(
    (id) => favorites.find((favorite) => favorite.id === id)?.label ?? String(id),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    // Cleared after the click the drop makes has been ignored.
    setTimeout(() => {
      dragging.current = false;
    });

    if (!over || active.id === over.id) return;

    const ids = favorites.map(({ id }) => id);

    reorder.mutate({
      ids: arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))),
    });
  };

  if (!favorites.length) return null;

  return (
    <section className="py-1 first:pt-0">
      <h2 className="flex h-7 items-center px-2 text-3xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t('title', 'Favorites')}
      </h2>
      <DndContext
        {...sortList}
        autoScroll={false}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        sensors={sensors}
        onDragStart={() => {
          dragging.current = true;
        }}
        onDragCancel={() => {
          dragging.current = false;
        }}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={favorites.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-0.5">
            {favorites.map((favorite) => (
              <FavoriteRow
                key={favorite.id}
                favorite={favorite}
                onOpen={onOpen}
                onRemove={() => remove.mutate({ id: favorite.id })}
                wasDragged={() => dragging.current}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
};
