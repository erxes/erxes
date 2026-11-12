import { Button } from 'erxes-ui/components/button';
import { RadioGroup } from 'erxes-ui/components/radio-group';
import { cn } from 'erxes-ui/lib/utils';
import { useEffect, useId, useRef } from 'react';
import { getYearsArray } from '../utils/getYears';

const DateFilterRadioGroupItem = ({
  id,
  value,
  children,
  currentValue,
}: {
  id: string;
  value: string;
  children: React.ReactNode;
  currentValue: string | null;
}) => {
  const ref = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    if (currentValue === value && ref.current) {
      setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'instant', block: 'center' });
      }, 100);
    }
  }, [currentValue, value]);

  return (
    <Button
      variant="secondary"
      className="shadow-none has-data-[state=checked]:border-ring has-data-[state=checked]:bg-primary has-data-[state=checked]:text-primary-foreground has-focus-visible:outline-solid has-focus-visible:outline-2 has-focus-visible:outline-ring/70 capitalize"
      onClick={() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }}
      asChild
    >
      <label ref={ref} id={`${id}-${value}`}>
        <RadioGroup.Item
          value={value}
          id={`${id}-${value}`}
          className="sr-only after:absolute after:inset-0"
        />
        {children}
      </label>
    </Button>
  );
};

/** Year-by-year choices: `items` within each year (months, quarters, halves), or whole years. */
export const DateFilterRadioGroup = ({
  items,
  className,
  value,
  onValueChange,
}: {
  items?: string[];
  className: string;
  value: string | null;
  onValueChange?: (value: string) => void;
}) => {
  const id = useId();

  return (
    <RadioGroup asChild value={value ?? ''} onValueChange={onValueChange}>
      <fieldset className={cn('gap-6 w-full px-6 pb-6', className)}>
        {getYearsArray(7, 5).map((year) =>
          items ? (
            <div className="flex flex-col gap-3" key={year}>
              <legend className="font-semibold text-sm leading-none">{year}</legend>
              <div
                className={cn(
                  'grid gap-1',
                  items.length === 12 && 'grid-cols-3',
                  items.length === 2 && 'grid-cols-2',
                  items.length === 4 && 'grid-cols-4',
                )}
              >
                {items.map((item) => (
                  <DateFilterRadioGroupItem
                    id={id}
                    value={`${year}-${item}`}
                    key={item}
                    currentValue={value}
                  >
                    {item.split('-').join(' ')}
                  </DateFilterRadioGroupItem>
                ))}
              </div>
            </div>
          ) : (
            <DateFilterRadioGroupItem id={id} value={`${year}-y`} key={year} currentValue={value}>
              {year}
            </DateFilterRadioGroupItem>
          ),
        )}
      </fieldset>
    </RadioGroup>
  );
};
