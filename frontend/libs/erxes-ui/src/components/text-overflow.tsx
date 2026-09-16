import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  type RefObject,
  type ForwardedRef,
  type InputHTMLAttributes,
} from 'react';
import { Tooltip } from './tooltip';
import { inputVariants } from './input';
import { cn } from 'erxes-ui/lib';

function useIsOverflowing<T extends HTMLElement>(
  ref: RefObject<T> | ForwardedRef<T>,
  value?: string,
) {
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const element = ref && 'current' in ref ? ref.current : null;
      if (element) {
        setIsOverflowing(element.scrollWidth > element.clientWidth);
      }
    };

    const timeoutId = setTimeout(checkOverflow, 100);

    const handleResize = () => {
      clearTimeout(timeoutId);
      setTimeout(checkOverflow, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [value, ref]);

  return isOverflowing;
}

interface TextOverflowTooltipProps {
  value?: string;
  className?: string;
  delayDuration?: number;
}

const TextOverflowTooltipRoot = forwardRef<
  HTMLSpanElement,
  TextOverflowTooltipProps
>(({ value, className, delayDuration = 100 }, forwardedRef) => {
  const innerRef = useRef<HTMLSpanElement>(null);
  const textRef = forwardedRef || innerRef;
  const isOverflowing = useIsOverflowing(textRef, value);

  return (
    <Tooltip.Provider delayDuration={delayDuration}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span ref={textRef} className={cn('truncate w-full', className)}>
            {value}
          </span>
        </Tooltip.Trigger>
        {isOverflowing && (
          <Tooltip.Content>
            <span>{value}</span>
          </Tooltip.Content>
        )}
      </Tooltip>
    </Tooltip.Provider>
  );
});

TextOverflowTooltipRoot.displayName = 'TextOverflowTooltip';

interface TextOverflowTooltipInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  delayDuration?: number;
}

const TextOverflowTooltipInput = forwardRef<
  HTMLInputElement,
  TextOverflowTooltipInputProps
>(
  (
    { value, onChange, className, delayDuration = 100, ...props },
    forwardedRef,
  ) => {
    const innerRef = useRef<HTMLInputElement>(null);
    const inputRef = forwardedRef || innerRef;
    const isOverflowing = useIsOverflowing(inputRef, value);

    return (
      <Tooltip.Provider delayDuration={delayDuration}>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              className={cn(inputVariants(), className)}
              {...props}
            />
          </Tooltip.Trigger>
          {isOverflowing && value && (
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
