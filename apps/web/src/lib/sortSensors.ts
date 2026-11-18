import {
  type Announcements,
  KeyboardSensor,
  MouseSensor,
  type ScreenReaderInstructions,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';

/** A sortable list's drag handles: a 6px mouse drag, a held touch, or the arrow keys. */
export const useSortSensors = () =>
  useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

/** Mouse or touch only, for tabs and links: their keys already switch or open them. */
export const usePointerSortSensors = () =>
  useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

/**
 * A sortable list's `DndContext` `accessibility`: how its items move and what a screen reader
 * hears as one does, in the member's language, naming items by `nameOf(id)`. `keyboard` when
 * the list takes `useSortSensors()`, so the instructions name the keys; else the pointer's.
 */
export const useSortAccessibility = (
  nameOf: (id: string) => string,
  { keyboard }: { keyboard: boolean },
): { screenReaderInstructions: ScreenReaderInstructions; announcements: Announcements } => {
  const { t } = useTranslation('common', { keyPrefix: 'sort' });
  const name = (id: UniqueIdentifier) => nameOf(String(id));

  return {
    screenReaderInstructions: {
      draggable: keyboard
        ? t(
            'keyboard',
            'Press Space to pick it up, the arrow keys to move it, Space again to drop it, or Escape to cancel.',
          )
        : t('pointer', 'Drag it with the mouse, or touch and hold, to move it.'),
    },
    announcements: {
      onDragStart: ({ active }) => t('picked', 'Picked up {{name}}.', { name: name(active.id) }),
      onDragOver: ({ active, over }) =>
        over
          ? t('over', '{{name}} is over {{target}}.', {
              name: name(active.id),
              target: name(over.id),
            })
          : t('nowhere', '{{name}} is over no place.', { name: name(active.id) }),
      onDragEnd: ({ active, over }) =>
        over && over.id !== active.id
          ? t('dropped', 'Dropped {{name}} over {{target}}.', {
              name: name(active.id),
              target: name(over.id),
            })
          : t('dropped-back', 'Dropped {{name}} where it was.', { name: name(active.id) }),
      onDragCancel: ({ active }) =>
        t('cancelled', 'Put {{name}} back where it was.', { name: name(active.id) }),
    },
  };
};
