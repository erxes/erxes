import { cn, Tooltip } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { usePanelExpanded } from './RecordSidePanel';

/** Whether the label is cut off; the observers see the clamp come and go with the panel width. */
const useIsClamped = () => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const check = () => setIsClamped(element.scrollHeight > element.clientHeight + 1);
    const resizeObserver = new ResizeObserver(check);
    const contentObserver = new MutationObserver(check);

    check();
    resizeObserver.observe(element);
    contentObserver.observe(element, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      resizeObserver.disconnect();
      contentObserver.disconnect();
    };
  }, []);

  return { ref, isClamped };
};

export const PanelLabel = ({
  children,
  tooltip,
  className,
}: {
  children: React.ReactNode;
  tooltip?: React.ReactNode;
  className?: string;
}) => {
  const expanded = usePanelExpanded();
  const { ref, isClamped } = useIsClamped();
  const showTooltip = isClamped && !expanded;

  return (
    <Tooltip.Provider delay={100}>
      <Tooltip>
        <Tooltip.Trigger
          render={<span className={cn('my-1 block min-w-0 wrap-break-word', className)} />}
        >
          <span ref={ref} className={cn('block', !expanded && 'line-clamp-2')}>
            {children}
          </span>
        </Tooltip.Trigger>
        {showTooltip && <Tooltip.Content>{tooltip ?? children}</Tooltip.Content>}
      </Tooltip>
    </Tooltip.Provider>
  );
};
