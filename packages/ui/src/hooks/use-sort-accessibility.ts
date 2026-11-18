import type {
  Announcements,
  DndContextProps,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * What a screen reader calls a sortable item, in the UI's language. Pass it as
 * `useSortable({ attributes: { roleDescription } })`; dnd-kit says "sortable" in English without it.
 */
export const useSortRoleDescription = () =>
  useTranslation('ui', { keyPrefix: 'sort' }).t('role', 'sortable');

/**
 * What a screen reader says as a sorted item moves, in the UI's language. Pass it as
 * dnd-kit's `DndContext accessibility`; without it dnd-kit speaks English ("Picked up draggable
 * item …").
 * `nameOf` gives an item's name from its id; the id is read out without it. `pointer` for a list
 * only the mouse or touch moves (tabs and links, whose keys switch or open them): its
 * instructions say to drag, not to press Space. A list takes `useSortList`, which adds the id
 * its `DndContext` needs on a page with other lists.
 */
export const useSortAccessibility = (
  nameOf: (id: UniqueIdentifier) => string = String,
  { pointer = false }: { pointer?: boolean } = {},
): { announcements: Announcements; screenReaderInstructions: ScreenReaderInstructions } => {
  const { t } = useTranslation('ui', { keyPrefix: 'sort' });

  return {
    screenReaderInstructions: {
      draggable: pointer
        ? t(
            'pointer-instructions',
            'Drag the item with the mouse, or touch and hold it, to move it.',
          )
        : t(
            'instructions',
            'Press Space to pick up the item, the arrow keys to move it, Space again to drop it, or Escape to cancel.',
          ),
    },
    announcements: {
      onDragStart: ({ active }) => t('picked', 'Picked up {{item}}.', { item: nameOf(active.id) }),
      onDragOver: ({ active, over }) =>
        over
          ? t('over', '{{item}} is over {{target}}.', {
              item: nameOf(active.id),
              target: nameOf(over.id),
            })
          : t('outside', '{{item}} is no longer over a place to drop it.', {
              item: nameOf(active.id),
            }),
      onDragEnd: ({ active, over }) =>
        over
          ? t('dropped', 'Dropped {{item}} over {{target}}.', {
              item: nameOf(active.id),
              target: nameOf(over.id),
            })
          : t('dropped-nowhere', 'Dropped {{item}}.', { item: nameOf(active.id) }),
      onDragCancel: ({ active }) =>
        t('cancelled', 'Put {{item}} back where it was.', { item: nameOf(active.id) }),
    },
  };
};

/**
 * The id and screen reader words a sortable list's `DndContext` takes.
 * Spread them: `<DndContext {...useSortList(nameOf)} onDragEnd={…}>`; `nameOf` and `pointer`
 * are `useSortAccessibility`'s. The id comes from React, which core and plugins share, so it is
 * unique on the page. Without it each copy of dnd-kit, core's and every plugin's, numbers its
 * instructions from `DndDescribedBy-0`, and a plugin's items read core's tab bar's instructions.
 */
export const useSortList = (
  nameOf?: (id: UniqueIdentifier) => string,
  options?: { pointer?: boolean },
): Required<Pick<DndContextProps, 'id' | 'accessibility'>> => ({
  id: useId(),
  accessibility: useSortAccessibility(nameOf, options),
});
