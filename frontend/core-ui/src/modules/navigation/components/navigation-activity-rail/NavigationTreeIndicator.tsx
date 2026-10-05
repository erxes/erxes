import { cn } from 'erxes-ui';
import { RefObject, useEffect, useRef, useState } from 'react';

const ACTIVE_ITEM_SELECTOR =
  '[data-sidebar=menu-button][data-active=true], [data-sidebar=menu-sub-button][data-active=true]';

type TIndicatorPosition = { top: number; height: number };

const getOffsetWithin = (element: HTMLElement, container: HTMLElement) => {
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== container) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return current === container ? top : null;
};

const measure = (container: HTMLElement): TIndicatorPosition | null => {
  const active = container.querySelector<HTMLElement>(ACTIVE_ITEM_SELECTOR);

  if (!active || active.offsetHeight === 0) {
    return null;
  }

  const closedAncestor = active.parentElement?.closest('[data-state=closed]');

  if (closedAncestor && container.contains(closedAncestor)) {
    return null;
  }

  const top = getOffsetWithin(active, container);

  return top === null ? null : { top, height: active.offsetHeight };
};

export const NavigationTreeIndicator = ({
  containerRef,
}: Readonly<{ containerRef: RefObject<HTMLElement | null> }>) => {
  const [position, setPosition] = useState<TIndicatorPosition | null>(null);
  const [animate, setAnimate] = useState(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(container);

        setAnimate(visibleRef.current && next !== null);
        visibleRef.current = next !== null;
        setPosition((previous) =>
          previous?.top === next?.top && previous?.height === next?.height
            ? previous
            : next,
        );
      });
    };

    update();

    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(container, {
      attributes: true,
      attributeFilter: ['data-active', 'data-state'],
      childList: true,
      subtree: true,
    });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  if (!position) {
    return null;
  }

  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-0 -left-[1.5px] w-0.5 rounded-full bg-primary will-change-transform',
        animate &&
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
      )}
      style={{
        height: position.height - 8,
        transform: `translateY(${position.top + 4}px)`,
      }}
    />
  );
};
