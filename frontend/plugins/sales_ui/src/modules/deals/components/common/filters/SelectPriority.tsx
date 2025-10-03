import {
  Combobox,
  Command,
  Filter,
  Popover,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import {
  PROJECT_PRIORITIES_OPTIONS,
  TPriorityValue,
} from '@/deals/constants/cards';
import React, { useState } from 'react';

import { IconStackFront } from '@tabler/icons-react';

interface SelectPriorityContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const SelectPriorityContext =
  React.createContext<SelectPriorityContextType | null>(null);

const useSelectPriorityContext = () => {
  const context = React.useContext(SelectPriorityContext);
  if (!context) {
    throw new Error(
      'useSelectPriorityContext must be used within SelectPriorityProvider',
    );
  }
  return context;
};

const getPriorityIndex = (priority: string) =>
  PROJECT_PRIORITIES_OPTIONS.findIndex((p) => p === priority);

export const PriorityIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement> & { priority: string }
>(({ priority, className, ...props }, ref) => {
  const index = getPriorityIndex(priority);
  const color =
    [
      'text-muted-foreground',
      'text-success',
      'text-info',
      'text-warning',
      'text-destructive',
    ][index] || 'text-muted-foreground';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={3}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4', color, className)}
      {...props}
      ref={ref}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path
        d="M6 18l0 -3"
        className={index > 0 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M10 18l0 -6"
        className={index > 1 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M14 18l0 -9"
        className={index > 2 ? 'stroke-current' : 'stroke-scroll'}
      />
      <path
        d="M18 18l0 -12"
        className={index > 3 ? 'stroke-current' : 'stroke-scroll'}
      />
    </svg>
  );
});

PriorityIcon.displayName = 'PriorityIcon';

export const PriorityTitle = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { priority: string }
>(({ priority, className, ...props }, ref) => {
  const index = getPriorityIndex(priority);
  const text = PROJECT_PRIORITIES_OPTIONS[index];
  return (
    <span
      ref={ref}
      className={cn(
        'font-medium',
        index === 0 && 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {text}
    </span>
  );
});

PriorityTitle.displayName = 'PriorityTitle';

const SelectPriorityProvider = ({
  children,
  value = 'No Priority',
  onValueChange,
}: {
  children: React.ReactNode;
  value?: TPriorityValue;
  onValueChange: (value: TPriorityValue) => void;
}) => (
  <SelectPriorityContext.Provider value={{ value, onValueChange }}>
    {children}
  </SelectPriorityContext.Provider>
);

const SelectPriorityCommandItem = ({ priority }: { priority: string }) => {
  const { onValueChange, value } = useSelectPriorityContext();

  return (
    <Command.Item value={priority} onSelect={() => onValueChange(priority)}>
      <div className="flex items-center gap-2 flex-1">
        <PriorityIcon priority={priority} />
        <PriorityTitle priority={priority} />
      </div>
      <Combobox.Check checked={value === priority} />
    </Command.Item>
  );
};

const SelectPriorityContent = () => {
  return (
    <Command>
      <Command.Input placeholder="Search priority" />
      <Command.Empty>No priority found</Command.Empty>
      <Command.List>
        {PROJECT_PRIORITIES_OPTIONS.map((priority) => (
          <SelectPriorityCommandItem key={priority} priority={priority} />
        ))}
      </Command.List>
    </Command>
  );
};

export const SelectPriorityFilterItem = ({
  value,
  label,
}: {
  value: string;
  label: string;
}) => {
  return (
    <Filter.Item value={value}>
      <IconStackFront />
      {label}
    </Filter.Item>
  );
};

const SelectPriorityFilterView = () => {
  const [priority, setPriority] = useQueryState<TPriorityValue[]>('priority', {
    defaultValue: [],
  });
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey="priority">
      <SelectPriorityProvider
        value={priority?.[0] ?? 'No Priority'}
        onValueChange={(val) => {
          setPriority([val]);
          resetFilterState();
        }}
      >
        <SelectPriorityContent />
      </SelectPriorityProvider>
    </Filter.View>
  );
};

const SelectPriorityFilterBar = () => {
  const [priority, setPriority] = useQueryState<TPriorityValue[]>('priority', {
    defaultValue: [],
  });
  const [open, setOpen] = useState(false);

  if (!priority?.[0]) return null;

  return (
    <Filter.BarItem queryKey="priority">
      <Filter.BarName>
        <IconStackFront />
        By Priority
      </Filter.BarName>
      <SelectPriorityProvider
        value={priority?.[0] ?? 'No Priority'}
        onValueChange={(val) => {
          if (val && val !== 'No Priority') setPriority([val]);
          else setPriority([]);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey="priority">
              <PriorityIcon priority={priority?.[0] ?? 'No Priority'} />
              <PriorityTitle priority={priority?.[0] ?? 'No Priority'} />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectPriorityContent />
          </Combobox.Content>
        </Popover>
      </SelectPriorityProvider>
    </Filter.BarItem>
  );
};

export const SelectPriority = Object.assign(SelectPriorityProvider, {
  FilterBar: SelectPriorityFilterBar,
  FilterView: SelectPriorityFilterView,
  FilterItem: SelectPriorityFilterItem,
});
