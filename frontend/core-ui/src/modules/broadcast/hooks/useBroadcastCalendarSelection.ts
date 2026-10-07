import { useEffect, useState } from 'react';
import { isSameRange, orderRange, TDayRange } from '../utils/calendarMonth';
import { useBroadcastScheduleRange } from './useBroadcastScheduleRange';

type TDraft = { anchor: Date; head: Date };

/**
 * Days picked by dragging across the grid.
 *
 * The drag itself is local: writing every cell the pointer crosses into the
 * URL would fill the history with a gesture. Only where it comes to rest is
 * committed, which is what the creation sheet then reads.
 */
export const useBroadcastCalendarSelection = () => {
  const { range: committed, setRange, clearRange } = useBroadcastScheduleRange();
  const [draft, setDraft] = useState<TDraft | null>(null);

  // The URL is a navigation, so it lands a render after the gesture ends. Held
  // here until it does, or the grid drops back to the previous selection for a
  // frame on its way to the new one.
  const [settled, setSettled] = useState<TDayRange | null>(null);

  const range: TDayRange | undefined = draft
    ? orderRange(draft.anchor, draft.head)
    : settled ?? committed;

  useEffect(() => {
    if (settled && isSameRange(settled, committed)) {
      setSettled(null);
    }
  }, [settled, committed]);

  // A drag that ends anywhere — off the grid, outside the window — is still a
  // finished selection, so the release is listened for on the document.
  useEffect(() => {
    if (!draft) {
      return;
    }

    const finish = () => {
      const chosen = orderRange(draft.anchor, draft.head);

      setSettled(chosen);
      setRange(chosen);
      setDraft(null);
    };

    window.addEventListener('pointerup', finish);

    return () => window.removeEventListener('pointerup', finish);
    // Only the drag itself: re-subscribing whenever the range setter is
    // rebuilt would tear the listener down mid-gesture.
  }, [draft]);

  return {
    range,
    isDragging: !!draft,
    startSelection: (date: Date) => setDraft({ anchor: date, head: date }),
    extendSelection: (date: Date) =>
      setDraft((current) => (current ? { ...current, head: date } : current)),
    clearSelection: () => {
      setDraft(null);
      setSettled(null);
      clearRange();
    },
  };
};
