import { useAtomValue, useSetAtom } from 'jotai';
import { useLayoutEffect, useRef, type PropsWithChildren } from 'react';
import {
  appLayoutPageOverlayState,
  appLayoutPageTargetState,
} from 'erxes-ui/modules/layout/states/appLayoutPageState';

// A page can be replaced by a record while the app's navigation stays mounted.
export const AppLayoutPageSlot = ({ children }: PropsWithChildren) => {
  const ref = useRef<HTMLDivElement>(null);
  const target = useAtomValue(appLayoutPageTargetState);
  const setTarget = useSetAtom(appLayoutPageTargetState);
  const overlayOpen = useAtomValue(appLayoutPageOverlayState);
  const active = overlayOpen && target === ref.current;

  useLayoutEffect(() => {
    const element = ref.current;
    setTarget(element);

    return () => setTarget((current) => (current === element ? null : current));
  }, [setTarget]);

  return (
    <>
      <div
        hidden={active}
        {...(active ? { inert: '' } : {})}
        className={active ? 'hidden' : 'flex min-h-0 min-w-0 flex-1 flex-col'}
      >
        {children}
      </div>
      <div
        ref={ref}
        hidden={!active}
        className={active ? 'flex min-h-0 min-w-0 flex-1 flex-col' : 'hidden'}
      />
    </>
  );
};
