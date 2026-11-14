import { Label } from 'erxes-ui/components/label';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { useId } from 'react';
import { cn } from 'erxes-ui/lib/utils';
import { type RadioGroupProps } from './radio-group';

interface ChoiceboxGroupProps extends Omit<RadioGroupProps, 'className'> {
  className?: string;
  direction?: 'column' | 'row';
  spacing?: 'default' | 'tight' | 'loose';
}

const ChoiceboxGroupRoot = ({
  children,
  className,
  direction = 'column',
  spacing = 'default',
  ...props
}: ChoiceboxGroupProps) => {
  return (
    <RadioGroup className="w-full" {...props}>
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
};

interface ChoiceboxItemProps extends Omit<ComponentPropsWithoutRef<'div'>, 'title'> {
  value: string;
  title?: React.ReactNode;
  disabled?: boolean;
  children: ReactNode;
}

const ChoiceboxItem = ({
  ref,
  className,
  value,
  title,
  disabled,
  children,
}: ChoiceboxItemProps & React.RefAttributes<HTMLLabelElement>) => {
  const id = useId();

  return (
    <label
      key={`${id}-${value}`}
      ref={ref}
      className={cn(
        ' relative cursor-pointer justify-center  h-min rounded-sm  transition w-full outline-hidden bg-accent hover:bg-border hover:cursor-pointer ',
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
          'w-full h-full rounded-sm border border-transparent peer-data-checked:border-primary peer-data-checked:bg-primary/10 peer-data-checked:text-primary-text  p-3 flex-col gap-1.5 flex',
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
};

export const ChoiceboxGroup = Object.assign(ChoiceboxGroupRoot, {
  Item: ChoiceboxItem,
});
