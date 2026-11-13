import { useRef, useState, forwardRef, type RefObject, type InputHTMLAttributes } from 'react';
import { mergeRefs } from 'react-merge-refs';
import { Tooltip } from './tooltip';
import { inputVariants } from './input';
import { cn } from 'erxes-ui/lib/utils';

/** A tooltip that opens only while the element's text is cut off, measured when it would open. */
function useOverflowTooltip<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [open, setOpen] = useState(false);

  const onOpenChange = (next: boolean) => {
    const element = ref.current;

    setOpen(next && element !== null && element.scrollWidth > element.clientWidth);
  };

  return { open, onOpenChange };
}

interface TextOverflowTooltipProps {
  value?: string;
  className?: string;
  delayDuration?: number;
}

const TextOverflowTooltipRoot = forwardRef<HTMLSpanElement, TextOverflowTooltipProps>(
  ({ value, className, delayDuration = 100 }, forwardedRef) => {
    const innerRef = useRef<HTMLSpanElement>(null);
    const tooltip = useOverflowTooltip(innerRef);

    return (
      <Tooltip.Provider delayDuration={delayDuration}>
        <Tooltip {...tooltip}>
          <Tooltip.Trigger asChild>
            <span
              ref={mergeRefs([innerRef, forwardedRef])}
              className={cn('truncate w-full', className)}
            >
              {value}
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <span>{value}</span>
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    );
  },
);

TextOverflowTooltipRoot.displayName = 'TextOverflowTooltip';

interface TextOverflowTooltipInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> {
  value?: string;
  onChange?: (value: string) => void;
  delayDuration?: number;
}

const TextOverflowTooltipInput = forwardRef<HTMLInputElement, TextOverflowTooltipInputProps>(
  ({ value, onChange, className, delayDuration = 100, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLInputElement>(null);
    const tooltip = useOverflowTooltip(innerRef);

    return (
      <Tooltip.Provider delayDuration={delayDuration}>
        <Tooltip {...tooltip}>
          <Tooltip.Trigger asChild>
            <input
              ref={mergeRefs([innerRef, forwardedRef])}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(inputVariants(), className)}
              {...props}
            />
          </Tooltip.Trigger>
          {value && (
            <Tooltip.Content>
              <span>{value}</span>
            </Tooltip.Content>
          )}
        </Tooltip>
      </Tooltip.Provider>
    );
  },
);

TextOverflowTooltipInput.displayName = 'TextOverflowTooltip.Input';

export const TextOverflowTooltip = Object.assign(TextOverflowTooltipRoot, {
  Input: TextOverflowTooltipInput,
});
