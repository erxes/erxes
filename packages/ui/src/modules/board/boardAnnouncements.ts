import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';
import type { BoardCards } from './boardContext';

/** What a screen reader hears while a card moves, by card and column title. */
export const useBoardAccessibility = (
  cards: BoardCards,
): { announcements: Announcements; screenReaderInstructions: ScreenReaderInstructions } => {
  const { t } = useTranslation('views', { keyPrefix: 'board' });
  const title = (id: string | number) => cards.titleOf(String(id));

  const place = (id: string | number) => {
    const column = cards.columnOf(String(id));

    return column
      ? t('above', 'above {{card}} in {{column}}', { card: title(id), column: title(column) })
      : t('in', 'in {{column}}', { column: title(id) });
  };

  return {
    screenReaderInstructions: {
      draggable: t(
        'instructions',
        'Press Enter to open the card. Press Space to pick it up, the arrow keys to move it, Space again to drop it, or Escape to cancel.',
      ),
    },
    announcements: {
      onDragStart: ({ active }) => t('picked', 'Picked up {{card}}.', { card: title(active.id) }),
      onDragOver: ({ active, over }) =>
        over && over.id !== active.id
          ? t('over', '{{card}} is {{place}}.', { card: title(active.id), place: place(over.id) })
          : t('nowhere', '{{card}} is where it was.', { card: title(active.id) }),
      onDragEnd: ({ active, over }) =>
        over && over.id !== active.id
          ? t('dropped', 'Dropped {{card}} {{place}}.', {
              card: title(active.id),
              place: place(over.id),
            })
          : t('dropped-nowhere', 'Dropped {{card}} where it was.', { card: title(active.id) }),
      onDragCancel: ({ active }) =>
        t('cancelled', 'Put {{card}} back where it was.', { card: title(active.id) }),
    },
  };
};
