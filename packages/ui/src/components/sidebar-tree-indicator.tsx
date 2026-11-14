import React from 'react';
import { cn } from 'erxes-ui/lib/utils';

type TIndicatorPosition = { top: number; height: number };

export type TFindActiveTreeItem = (container: HTMLElement) => HTMLElement | null;

const findActiveSubItem: TFindActiveTreeItem = (container) =>
  container.querySelector<HTMLElement>(
    ':scope > li > [data-sidebar=menu-sub-button][data-active=true]',
  );

const getOffsetWithin = (element: HTMLElement, container: HTMLElement) => {
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== container) {
    top += current.offsetTop;
    current = current.offsetParent instanceof HTMLElement ? current.offsetParent : null;
  }

  return current === container ? top : null;
};

const measure = (
  container: HTMLElement,
  findActive: TFindActiveTreeItem,
): TIndicatorPosition | null => {
  const active = findActive(container);

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

export const SidebarTreeIndicator = ({
  as: Element = 'span',
  containerRef,
  findActive = findActiveSubItem,
}: Readonly<{
  as?: 'li' | 'span';
  containerRef: React.RefObject<HTMLElement | null>;
  findActive?: TFindActiveTreeItem;
}>) => {
  const [position, setPosition] = React.useState<TIndicatorPosition | null>(null);
  const [animate, setAnimate] = React.useState(false);
  const visibleRef = React.useRef(false);

  React.useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure(container, findActive);

        setAnimate(visibleRef.current && next !== null);
        visibleRef.current = next !== null;
        setPosition((previous) =>
          previous?.top === next?.top && previous?.height === next?.height ? previous : next,
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
  }, [containerRef, findActive]);

  if (!position) {
    return null;
  }

  return (
    <Element
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-0 -left-0.5 h-(--indicator-height) w-0.5 translate-y-(--indicator-top) list-none rounded-full bg-primary will-change-transform',
        animate && 'transition-transform duration-300 ease-out-quint motion-reduce:transition-none',
      )}
      style={{
        '--indicator-height': `${position.height - 8}px`,
        '--indicator-top': `${position.top + 4}px`,
      }}
    />
  );
};
