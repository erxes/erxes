import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  appLayoutPageOverlayState,
  appLayoutPageTargetState,
  useQueryState,
} from 'erxes-ui';
import { useSidePanel } from 'ui-modules';

const recordPageTargetState = atom<HTMLDivElement | null>(null);

/** Provides a page replacement target when the route has no AppLayout host. */
export const RecordPageSlot = ({ children }: React.PropsWithChildren) => {
  const [expanded] = useQueryState<boolean>('panelExpanded');
  const { open, record } = useSidePanel();
  const setTarget = useSetAtom(recordPageTargetState);
  const appPageTarget = useAtomValue(appLayoutPageTargetState);
  const setPageTarget = useCallback(
    (element: HTMLDivElement | null) => setTarget(element),
    [setTarget],
  );
  const active = Boolean(!appPageTarget && expanded && open && record);

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div
        hidden={active}
        {...(active ? { inert: '' } : {})}
        className={active ? 'hidden' : 'flex min-h-0 min-w-0 flex-1 flex-col'}
      >
        {children}
      </div>
      <div
        ref={setPageTarget}
        hidden={!active}
        className={active ? 'flex min-h-0 min-w-0 flex-1 flex-col' : 'hidden'}
      />
    </div>
  );
};

// Keep the portal's container stable when moving a record into the app page.
// Changing the portal target itself would remount editors and discard drafts.
export const RecordPagePortal = ({
  active,
  children,
}: React.PropsWithChildren<{ active: boolean }>) => {
  const target = useAtomValue(recordPageTargetState);
  const appPageTarget = useAtomValue(appLayoutPageTargetState);
  const setOverlayOpen = useSetAtom(appLayoutPageOverlayState);
  const fallback = useRef<HTMLDivElement>(null);
  const [container] = useState(() => document.createElement('div'));
  container.className = 'contents';
  useLayoutEffect(() => {
    const parent = active
      ? appPageTarget || target || fallback.current
      : fallback.current;
    const focused = document.activeElement;
    parent?.appendChild(container);
    if (focused instanceof HTMLElement && container.contains(focused)) {
      focused.focus({ preventScroll: true });
    }
  }, [active, target, appPageTarget, container]);
  useLayoutEffect(() => {
    setOverlayOpen(active && Boolean(appPageTarget));
    return () => setOverlayOpen(false);
  }, [active, appPageTarget, setOverlayOpen]);
  useLayoutEffect(() => () => container.remove(), [container]);

  return (
    <>
      <div ref={fallback} className="contents" />
      {createPortal(children, container)}
    </>
  );
};
