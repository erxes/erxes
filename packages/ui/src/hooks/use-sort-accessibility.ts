import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from '@dnd-kit/core';
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
 * `nameOf` gives an item's name from its id; the id is read out without it.
 */
export const useSortAccessibility = (
  nameOf: (id: UniqueIdentifier) => string = String,
): { announcements: Announcements; screenReaderInstructions: ScreenReaderInstructions } => {
  const { t } = useTranslation('ui', { keyPrefix: 'sort' });

  return {
    screenReaderInstructions: {
      draggable: t(
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
