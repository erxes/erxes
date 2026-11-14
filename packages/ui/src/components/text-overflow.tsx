import { useRef, useState } from 'react';
import { Input } from '@base-ui/react/input';
import { Tooltip } from './tooltip';
import { inputVariants } from './input';
import { cn } from 'erxes-ui/lib/utils';

/** Opens the tooltip only while the element's text is cut off, measured when it would open. */
const useOverflowTooltip = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [open, setOpen] = useState(false);

  const onOpenChange = (next: boolean) => {
    const element = ref.current;

    setOpen(next && element !== null && element.scrollWidth > element.clientWidth);
  };

  return { ref, open, onOpenChange };
};

/** Shows the full value in a tooltip, only while the text is cut off. */
const TextOverflowTooltipRoot = ({ value, className }: { value?: string; className?: string }) => {
  const { ref, ...tooltip } = useOverflowTooltip<HTMLSpanElement>();

  return (
    <Tooltip {...tooltip}>
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

/** A text input whose tooltip shows the whole value while it doesn't fit. */
const TextOverflowTooltipInput = ({
  className,
  ...props
}: Omit<Input.Props, 'className'> & { className?: string; value?: string }) => {
  const { ref, ...tooltip } = useOverflowTooltip<HTMLInputElement>();

  return (
    <Tooltip {...tooltip}>
      <Tooltip.Trigger
        delay={100}
        render={<Input ref={ref} className={cn(inputVariants(), className)} {...props} />}
      />
      {props.value && (
        <Tooltip.Content>
          <span>{props.value}</span>
        </Tooltip.Content>
      )}
    </Tooltip>
  );
};

export const TextOverflowTooltip = Object.assign(TextOverflowTooltipRoot, {
  Input: TextOverflowTooltipInput,
});
