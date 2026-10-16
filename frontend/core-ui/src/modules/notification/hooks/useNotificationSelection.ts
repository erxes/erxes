import type { NotificationSelection } from '@/notification/types/myInbox';
import { selectedNotificationIdsState } from '@/notification/states/notificationState';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';

export const useNotificationSelection = (
  ids: string[],
  filterKey: string,
  activeId?: string,
): NotificationSelection => {
  const [selected, setSelected] = useAtom(selectedNotificationIdsState);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const anchor = useRef<string | null>(null);
  const keyboardBase = useRef<string[] | null>(null);

  const clear = (): void => {
    setSelected([]);
    anchor.current = null;
    setFocusedId(null);
    keyboardBase.current = null;
  };

  useEffect(() => {
    setSelected([]);
    anchor.current = null;
    setFocusedId(null);
    keyboardBase.current = null;
  }, [filterKey, setSelected]);

  useEffect(() => () => setSelected([]), [setSelected]);

  useEffect(() => {
    anchor.current = activeId ?? null;
    setFocusedId(null);
    keyboardBase.current = null;
  }, [activeId]);

  const select = (id: string, shiftKey: boolean): void => {
    const anchorIndex = anchor.current ? ids.indexOf(anchor.current) : -1;
    const targetIndex = ids.indexOf(id);
    if (targetIndex === -1) return;
    setFocusedId(id);
    keyboardBase.current = null;

    if (shiftKey && anchorIndex !== -1) {
      const range = ids.slice(
        Math.min(anchorIndex, targetIndex),
        Math.max(anchorIndex, targetIndex) + 1,
      );
      setSelected((previous) => [...new Set([...previous, ...range])]);
      return;
    }

    anchor.current = id;
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id],
    );
  };

  const extend = (direction: 1 | -1): void => {
    if (ids.length === 0) return;
    let anchorIndex = anchor.current ? ids.indexOf(anchor.current) : -1;
    if (anchorIndex === -1) {
      anchorIndex = activeId ? ids.indexOf(activeId) : -1;
    }
    const cursorIndex = focusedId ? ids.indexOf(focusedId) : -1;
    const startIndex = cursorIndex === -1 ? anchorIndex : cursorIndex;
    const initialIndex = direction === 1 ? 0 : ids.length - 1;
    const targetIndex =
      startIndex === -1
        ? initialIndex
        : Math.max(0, Math.min(ids.length - 1, startIndex + direction));
    if (anchorIndex === -1) anchorIndex = targetIndex;
    anchor.current = ids[anchorIndex];
    if (keyboardBase.current === null) keyboardBase.current = selected;
    const range = ids.slice(
      Math.min(anchorIndex, targetIndex),
      Math.max(anchorIndex, targetIndex) + 1,
    );
    setSelected([...new Set([...keyboardBase.current, ...range])]);
    setFocusedId(ids[targetIndex]);
  };

  return {
    selectedIds: selected.filter((id) => ids.includes(id)),
    focusedId,
    select,
    extend,
    setAnchor: (id) => {
      anchor.current = id;
      setFocusedId(null);
      keyboardBase.current = null;
    },
    clear,
  };
};
