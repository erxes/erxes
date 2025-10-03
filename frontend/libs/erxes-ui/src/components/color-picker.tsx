import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { Combobox, Popover, inputVariants } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import React, { createContext, useContext, useState } from 'react';
import { IMaskInput } from 'react-imask';

const DEFAULT_COLORS = {
  red: '#dc2626',
  orange: '#f97316',
  amber: '#f59e0b',
  yellow: '#eab308',
  lime: '#84cc16',
  green: '#16a34a',
  emerald: '#059669',
  cyan: '#06b6d4',
  sky: '#0ea5e9',
  blue: '#2563eb',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  purple: '#9333ea',
  fuchsia: '#c026d3',
  pink: '#db2777',
  rose: '#e11d48',
};

interface ColorPickerContextValue {
  value?: string;
  onValueChange?: (value: string) => void;
  colors: Record<string, string>;
}

const ColorPickerContext = createContext<ColorPickerContextValue | null>(null);

const useColorPickerContext = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error(
      'ColorPicker components must be used within ColorPickerProvider',
    );
  }
  return context;
};

export const ColorPickerProvider = ({
  children,
  value,
  onValueChange,
  colors = DEFAULT_COLORS,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  colors?: Record<string, string>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <ColorPickerContext.Provider
      value={{
        value,
        onValueChange,
        colors,
      }}
    >
      <Popover open={open} onOpenChange={onOpenChange}>
        {children}
      </Popover>
    </ColorPickerContext.Provider>
  );
};

const ColorPickerTrigger = React.forwardRef<
  React.ElementRef<typeof Combobox.TriggerBase>,
  React.ComponentPropsWithoutRef<typeof Combobox.TriggerBase>
>(({ className, children, ...props }, ref) => {
  return (
    <Combobox.TriggerBase
      ref={ref}
      variant="outline"
      className={cn('pl-1 pr-2 h-7', className)}
      {...props}
    >
      {children}
    </Combobox.TriggerBase>
  );
});

ColorPickerTrigger.displayName = 'ColorPickerTrigger';

const ColorPickerContent = ({
  setOpen,
}: {
  setOpen?: (open: boolean) => void;
}) => {
  const { value, onValueChange, colors } = useColorPickerContext();

  return (
    <Popover.Content className="p-1 w-64" align="start" sideOffset={8}>
      <div className="grid grid-cols-5 gap-1">
        {Object.entries(colors).map(([key, color]) => (
          <div
            key={key}
            className="aspect-[3/2] rounded flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => {
              onValueChange?.(color);
              setOpen?.(false);
            }}
          >
            {value === color && (
              <IconCheck className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
        ))}
        <div className="relative col-span-5">
          <div
            className="absolute size-7 rounded-[3px] top-0.5 left-0.5 flex items-center justify-center text-primary-foreground"
            style={{ backgroundColor: value }}
          >
            <input
              type="color"
              value={value || '#000000'}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => onValueChange?.(e.target.value)}
            />
            #
          </div>
          <IMaskInput
            mask={/^[0-9A-Fa-f]+$/}
            className={cn(inputVariants(), 'pl-9')}
            value={(value || '').replace('#', '')}
            onAccept={(value) => onValueChange?.('#' + value)}
          />
        </div>
      </div>
    </Popover.Content>
  );
};

const ColorPickerRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.TriggerBase>,
  Omit<React.ComponentPropsWithoutRef<typeof Combobox.TriggerBase>, 'value'> & {
    value?: string;
    onValueChange?: (value: string) => void;
    colors?: Record<string, string>;
  }
>(({ value, onValueChange, colors, className, ...props }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <ColorPickerProvider
      value={value}
      onValueChange={(newValue) => {
        onValueChange?.(newValue);
      }}
      colors={colors}
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
      }}
    >
      <ColorPickerTrigger ref={ref} className={className} {...props}>
        <div
          className={cn(
            'h-full w-full rounded shadow-inner',
            !value && 'bg-primary',
          )}
          style={{ backgroundColor: value }}
        />
        <IconChevronDown />
      </ColorPickerTrigger>
      <ColorPickerContent setOpen={setOpen} />
    </ColorPickerProvider>
  );
});

ColorPickerRoot.displayName = 'ColorPickerRoot';

export const ColorPicker = Object.assign(ColorPickerRoot, {
  Provider: ColorPickerProvider,
  Trigger: ColorPickerTrigger,
  Content: ColorPickerContent,
});
