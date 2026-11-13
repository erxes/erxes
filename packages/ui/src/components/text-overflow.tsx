import { useRef, useState } from 'react';
import { Tooltip } from './tooltip';
import { cn } from 'erxes-ui/lib/utils';

/** Shows the full value in a tooltip, only while the text is cut off. It measures when the tooltip would open. */
export const TextOverflowTooltip = ({
  value,
  className,
}: {
  value?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <Tooltip
      open={open}
      onOpenChange={(next) => {
        const element = ref.current;

        setOpen(next && element !== null && element.scrollWidth > element.clientWidth);
      }}
    >
      <Tooltip.Trigger
        delay={100}
        render={<span ref={ref} className={cn('truncate w-full', className)} />}
      >
        {value}
      </Tooltip.Trigger>
      <Tooltip.Content>
        <span>{value}</span>
      </Tooltip.Content>
    </Tooltip>
  );
};
