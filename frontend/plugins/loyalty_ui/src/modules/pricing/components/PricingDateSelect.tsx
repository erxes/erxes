import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Popover, Combobox, Button, Form, cn } from 'erxes-ui';
import {
  IconCalendarQuestion,
  IconCalendarTime,
  IconCalendarUp,
} from '@tabler/icons-react';

interface PricingDateSelectContextType {
  value?: Date;
  onSelect: (date?: Date) => void;
}

const PricingDateSelectContext =
  React.createContext<PricingDateSelectContextType | null>(null);

const usePricingDateSelectContext = () => {
  const context = React.useContext(PricingDateSelectContext);
  if (!context) {
    throw new Error(
      'usePricingDateSelectContext must be used within PricingDateSelectProvider',
    );
  }
  return context;
};

export const PricingDateSelectProvider = ({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode;
  value?: Date;
  onValueChange: (value?: Date) => void;
}) => {
  const onSelect = (date?: Date) => {
    onValueChange?.(date);
  };

  return (
    <PricingDateSelectContext.Provider
      value={{
        value,
        onSelect,
      }}
    >
      {children}
    </PricingDateSelectContext.Provider>
  );
};

const PricingDateSelectValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  const { value } = usePricingDateSelectContext();

  if (!value) {
    return (
      <span className="text-sm text-accent-foreground/80">
        {placeholder || 'Select date...'}
      </span>
    );
  }

  return (
    <span className="flex gap-2 items-center text-sm">
      <IconCalendarTime className="size-4" />
      {format(value, 'MMM d, yyyy')}
    </span>
  );
};

const PricingDateSelectFormItemValue = ({
  placeholder,
  type,
}: {
  placeholder?: string;
  type?: 'start' | 'target';
}) => {
  const { value } = usePricingDateSelectContext();

  if (!value) {
    return (
      <span className="flex gap-2 items-center text-sm text-accent-foreground/80">
        {type === 'start' ? (
          <IconCalendarUp className="size-4" />
        ) : (
          <IconCalendarQuestion className="size-4" />
        )}
        {placeholder || 'Select date'}
      </span>
    );
  }

  return (
    <span className="flex gap-2 items-center text-sm">
      <IconCalendarTime className="size-4" />
      <p className="text-sm font-medium text-foreground">
        {format(value, 'MMM d, yyyy')}
      </p>
    </span>
  );
};

const PricingDateSelectContent = () => {
  const { value, onSelect } = usePricingDateSelectContext();

  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onSelect}
      defaultMonth={value}
    />
  );
};

export const PricingDateSelectFormItem = React.forwardRef<
  HTMLButtonElement,
  {
    className?: string;
    placeholder?: string;
    value?: Date;
    onChange?: (value?: Date) => void;
    type?: 'start' | 'target';
  }
>(({ onChange, className, placeholder, value, type }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <PricingDateSelectProvider
      value={value}
      onValueChange={(val) => {
        onChange?.(val);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.TriggerBase
            ref={ref}
            className={cn('w-full shadow-xs', className)}
            asChild
          >
            <Button
              variant="secondary"
              className="justify-start px-3 w-full h-9 text-sm"
            >
              <PricingDateSelectFormItemValue
                placeholder={placeholder}
                type={type}
              />
            </Button>
          </Combobox.TriggerBase>
        </Form.Control>
        <Popover.Content className="w-fit">
          <PricingDateSelectContent />
        </Popover.Content>
      </Popover>
    </PricingDateSelectProvider>
  );
});

PricingDateSelectFormItem.displayName = 'PricingDateSelectFormItem';

const PricingDateSelectRoot = React.forwardRef<
  HTMLButtonElement,
  {
    onValueChange?: (value?: Date) => void;
    className?: string;
    value?: Date;
    placeholder?: string;
  }
>(({ onValueChange, className, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <PricingDateSelectProvider
      onValueChange={(val) => {
        onValueChange?.(val);
        setOpen(false);
      }}
      value={value}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          ref={ref}
          className={cn(
            'flex justify-between items-center px-3 py-2 w-full text-sm rounded-md border bg-background shadow-xs hover:bg-accent/40',
            className,
          )}
          {...props}
        >
          <PricingDateSelectValue placeholder={placeholder} />
        </Popover.Trigger>
        <Popover.Content className="w-fit">
          <PricingDateSelectContent />
        </Popover.Content>
      </Popover>
    </PricingDateSelectProvider>
  );
});

PricingDateSelectRoot.displayName = 'PricingDateSelectRoot';

export const PricingDateSelect = Object.assign(PricingDateSelectRoot, {
  Provider: PricingDateSelectProvider,
  Value: PricingDateSelectValue,
  Content: PricingDateSelectContent,
  FormItem: PricingDateSelectFormItem,
});
