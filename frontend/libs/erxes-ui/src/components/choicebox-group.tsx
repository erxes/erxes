import { Label, RadioGroup } from 'erxes-ui/components';
import { forwardRef, useId, ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from 'erxes-ui/lib';
import { type RadioGroupProps } from './radio-group';

export interface ChoiceboxGroupProps
  extends Omit<RadioGroupProps, 'className'> {
  className?: string;
  direction?: 'column' | 'row';
  spacing?: 'default' | 'tight' | 'loose';
}

const ChoiceboxGroupRoot = forwardRef<HTMLDivElement, ChoiceboxGroupProps>(
  (
    {
      children,
      className,
      direction = 'column',
      spacing = 'default',
      value,
      onValueChange,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    return (
      <RadioGroup
        ref={ref}
        className={cn('w-full')}
        value={value}
        onValueChange={onValueChange}
        defaultValue={defaultValue}
        {...props}
      >
        <div
          className={cn(
            'flex w-full h-max gap-2',
            direction === 'column' ? 'flex-col' : 'flex-row',
            className,
          )}
        >
          {children}
        </div>
      </RadioGroup>
    );
  },
);

ChoiceboxGroupRoot.displayName = 'ChoiceboxGroup';

export interface ChoiceboxItemProps
  extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  value: string;
  title?: React.ReactNode;
  disabled?: boolean;
  children: ReactNode;
}
const ChoiceboxItem = forwardRef<HTMLLabelElement, ChoiceboxItemProps>(
  ({ className, value, title, disabled, children }, ref) => {
    const id = useId();
    return (
      <label
        key={`${id}-${value}`}
        ref={ref}
        className={cn(
          ' relative cursor-pointer justify-center  h-min rounded-sm  transition-[color,box-shadow] w-full outline-none bg-accent hover:bg-border hover:cursor-pointer ',
        )}
      >
        <RadioGroup.Item
          id={`${id}-${value}`}
          value={value}
          className="peer sr-only after:absolute after:inset-0"
          disabled={disabled}
        />
        <div
          className={cn(
            'w-full h-full rounded-sm border border-transparent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary  p-3 flex-col gap-[6px] flex',
            className,
          )}
        >
          {title && (
            <Label
              htmlFor={`${id}-${value}`}
              className=" text-xs font-semibold text-muted-foreground normal-case font-sans"
            >
              {title}
            </Label>
          )}
          <span id={`${id}-1-description`} className="font-semibold text-sm">
            {children}
          </span>
        </div>
      </label>
    );
  },
);

ChoiceboxItem.displayName = 'ChoiceboxGroup.Item';

export const ChoiceboxGroup = Object.assign(ChoiceboxGroupRoot, {
  Item: ChoiceboxItem,
});
