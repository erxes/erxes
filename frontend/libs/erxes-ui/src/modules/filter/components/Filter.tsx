import React, { useEffect, useState } from 'react';
import { FilterContext } from '../context/FilterContext';
import { useFilterContext } from '../hooks/useFilterContext';
import {
  Button,
  Combobox,
  Command,
  Dialog,
  Input,
  Kbd,
  Popover,
  Tooltip,
} from 'erxes-ui/components';
import {
  IconFilter2,
  IconChevronRight,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { useRemoveQueryStateByKey } from 'erxes-ui/hooks';
import { Except } from 'type-fest';
import { cn } from 'erxes-ui/lib';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  filterDialogViewState,
  filterPopoverViewState,
  openDialogState,
  openPopoverState,
} from '../states/filterStates';
import { getDisplayValue } from '../date-filter/utils/getDisplayValue';
import { DateFilterCommand } from '../date-filter/components/DateFilterCommand';
import { usePreviousHotkeyScope } from 'erxes-ui/modules/hotkey/hooks/usePreviousHotkeyScope';
import { useFilterQueryState } from '../hooks/useFilterQueryState';
import { FilterDialogDateView } from '../date-filter/components/DialogDateView';

const FilterProvider = ({
  children,
  id,
  sessionKey,
}: {
  children: React.ReactNode;
  id: string;
  sessionKey?: string;
}) => {
  const setOpen = useSetAtom(openPopoverState(id));
  const setView = useSetAtom(filterPopoverViewState(id));
  const setDialogView = useSetAtom(filterDialogViewState(id));
  const setOpenDialog = useSetAtom(openDialogState(id));

  const resetFilterState = () => {
    setOpen(false);
    setView('root');
    setDialogView('root');
    setOpenDialog(false);
  };

  return (
    <FilterContext.Provider
      value={{
        id,
        sessionKey,
        resetFilterState,
        setOpen,
        setView,
        setDialogView,
        setOpenDialog,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

const FilterTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & {
    isFiltered?: boolean;
  }
>(({ isFiltered, ...props }, ref) => {
  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <Button
              ref={ref}
              variant="ghost"
              size={isFiltered ? 'icon' : 'default'}
              {...props}
            >
              <IconFilter2 className="w-4 h-4" />
              {!isFiltered && 'Filter'}
            </Button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>Filter</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
});

const FilterPopover = ({
  scope,
  ...props
}: React.ComponentPropsWithoutRef<typeof Popover> & {
  scope: string;
}) => {
  const { id } = useFilterContext();
  const [open, setOpen] = useAtom(openPopoverState(id));
  const setView = useSetAtom(filterPopoverViewState(id));
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  useEffect(() => {
    if (open) {
      setHotkeyScopeAndMemorizePreviousScope(scope + '.FilterPopover');
    } else {
      goBackToPreviousHotkeyScope();
    }
  }, [open]);

  return (
    <Popover
      open={open}
      onOpenChange={(op) => {
        setOpen(op);
        op && setView('root');
      }}
      {...props}
    />
  );
};

const FilterItem = React.forwardRef<
  React.ComponentRef<typeof Command.Item>,
  Except<React.ComponentPropsWithoutRef<typeof Command.Item>, 'value'> & {
    value: string;
    inDialog?: boolean;
    active?: boolean;
  }
>(({ children, value, inDialog, className, active, ...props }, ref) => {
  const { id } = useFilterContext();
  const setDialogView = useSetAtom(filterDialogViewState(id));
  const setOpenDialog = useSetAtom(openDialogState(id));
  const setOpen = useSetAtom(openPopoverState(id));
  const setView = useSetAtom(filterPopoverViewState(id));

  const onSelect = () => {
    if (inDialog) {
      setDialogView(value);
      setOpenDialog(true);
      setOpen(false);
    } else {
      setView(value);
    }
  };

  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      ref={ref}
      className={cn('h-8', active && 'text-primary', className)}
      {...props}
    >
      {children}
      <IconChevronRight className="w-4 h-4 ml-auto" />
    </Command.Item>
  );
});

const FilterCommandItem = React.forwardRef<
  React.ComponentRef<typeof Command.Item>,
  React.ComponentPropsWithoutRef<typeof Command.Item>
>(({ className, onSelect, ...props }, ref) => {
  const { id } = useFilterContext();
  const setOpen = useSetAtom(openPopoverState(id));

  const handleSelect = (value: string) => {
    setOpen(false);
    onSelect?.(value);
  };

  return (
    <Command.Item
      ref={ref}
      className={cn('h-8', className)}
      onSelect={(value) => handleSelect(value)}
      {...props}
    />
  );
});

const FilterView = ({
  children,
  filterKey = 'root',
  inDialog,
}: {
  children: React.ReactNode;
  filterKey?: string;
  inDialog?: boolean;
}) => {
  const { id } = useFilterContext();
  const view = useAtomValue(filterPopoverViewState(id));
  const dialogView = useAtomValue(filterDialogViewState(id));

  if (inDialog ? dialogView !== filterKey : view !== filterKey) {
    return null;
  }
  return children;
};

const FilterDialog = (props: React.ComponentPropsWithoutRef<typeof Dialog>) => {
  const { id, setOpenDialog, resetFilterState } = useFilterContext();
  const openDialog = useAtomValue(openDialogState(id));
  return (
    <Dialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
        !open && resetFilterState();
      }}
      {...props}
    />
  );
};

const FilterBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-wrap items-center gap-2 flex-1', className)}
      {...props}
    />
  );
});

const FilterBarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    queryKey?: string;
  }
>(({ className, queryKey, children, ...props }, ref) => {
  const [query] = useFilterQueryState<string>(queryKey || 'root');

  if (queryKey && !query) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded flex gap-px h-7 items-stretch shadow-xs bg-muted text-sm font-medium',
        className,
      )}
      {...props}
    >
      {children}
      <Filter.BarClose filterKey={queryKey} />
    </div>
  );
});

const FilterBarName = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-background rounded-l [&>svg]:size-4 flex items-center px-2 gap-2 w-fit',
        className,
      )}
      {...props}
    />
  );
});

const FilterBarButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  Except<React.ComponentPropsWithoutRef<typeof Button>, 'value'> & {
    inDialog?: boolean;
    filterKey?: string;
  }
>(({ className, inDialog, filterKey, ...props }, ref) => {
  const { setDialogView, setOpenDialog } = useFilterContext();

  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(
        'rounded-none focus-visible:z-10 max-w-72 transition-[color,box-shadow] focus-visible:shadow-focus outline-none focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:outline-transparent',
        !props.variant && 'bg-background',
        className,
      )}
      onClick={() => {
        if (inDialog) {
          setDialogView(filterKey ?? 'root');
          setOpenDialog(true);
        }
      }}
      {...props}
    />
  );
});

const FilterBarCloseButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  Except<React.ComponentPropsWithoutRef<typeof Button>, 'value'> & {
    filterKey?: string;
  }
>(({ className, filterKey, ...props }, ref) => {
  const removeQuery = useRemoveQueryStateByKey();
  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        'rounded-l-none',
        !props.variant && 'bg-background',
        className,
      )}
      onClick={() => removeQuery(filterKey ?? '')}
      {...props}
    >
      <IconX />
    </Button>
  );
});

const FilterDialogStringView = ({ filterKey }: { filterKey: string }) => {
  const { id, setDialogView, setOpenDialog, sessionKey } = useFilterContext();
  const dialogView = useAtomValue(filterDialogViewState(id));
  const [dialogSearch, setDialogSearch] = useState('');
  const [query, setQuery] = useFilterQueryState<string>(
    filterKey,
    sessionKey ?? '',
  );

  useEffect(() => {
    if (query) {
      setDialogSearch(query);
    }
  }, [dialogView, query]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setQuery(dialogSearch.length > 0 ? dialogSearch : null);
    setDialogView('root');
    setOpenDialog(false);
  };

  return (
    <Dialog.Content>
      <form onSubmit={onSubmit}>
        <Dialog.Header>
          <Dialog.Title className="font-medium text-lg">
            Filter by {filterKey}...
          </Dialog.Title>
        </Dialog.Header>

        <Input
          placeholder={filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
          className="my-4"
          value={dialogSearch}
          onChange={(e) => setDialogSearch(e.target.value)}
        />
        <Dialog.Footer className="sm:space-x-3">
          <Dialog.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Dialog.Close>
          <Button size="lg" type="submit">
            Apply
          </Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
};

const FilterPopoverDateView = ({ filterKey }: { filterKey: string }) => {
  const { resetFilterState } = useFilterContext();

  const [query, setQuery] = useFilterQueryState<string>(filterKey, filterKey);

  return (
    <DateFilterCommand
      focusOnMount
      value={filterKey}
      selected={query ?? ''}
      onSelect={(value) => {
        setQuery(value);
        resetFilterState();
      }}
    />
  );
};

const FilterBarDate = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button> & {
    filterKey: string;
  }
>(({ filterKey, className, ...props }, ref) => {
  const { sessionKey } = useFilterContext();
  const [query, setQuery] = useFilterQueryState<string>(
    filterKey,
    sessionKey ?? '',
  );
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          ref={ref}
          variant="ghost"
          className={cn('rounded-none h-7 bg-background', className)}
          {...props}
        >
          {getDisplayValue(query ?? '')}
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <DateFilterCommand
          value={filterKey}
          selected={query ?? ''}
          onSelect={(val) => {
            setQuery(val);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
});

const FilterCommandInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Command.Input>
>(({ className, ...props }, ref) => {
  return (
    <div className="relative">
      <Command.Input ref={ref} className={cn('pr-8', className)} {...props} />
      <Kbd
        className="absolute right-2 top-1/2 -translate-y-1/2"
        variant="foreground"
      >
        F
      </Kbd>
    </div>
  );
});

const FilterSearchValueTrigger = () => (
  <Filter.Item value="searchValue" inDialog>
    <IconSearch />
    Search
  </Filter.Item>
);
const FilterSearchValueBarItem = () => {
  const [searchValue] = useFilterQueryState<string>('searchValue');

  return (
    <Filter.BarItem queryKey="searchValue">
      <Filter.BarItem>
        <Filter.BarName>
          <IconSearch />
          Search
        </Filter.BarName>
        <Filter.BarButton filterKey="searchValue" inDialog>
          {searchValue}
        </Filter.BarButton>
      </Filter.BarItem>
    </Filter.BarItem>
  );
};

export const Filter = Object.assign(FilterProvider, {
  Trigger: FilterTrigger,
  Popover: FilterPopover,
  Item: FilterItem,
  CommandItem: FilterCommandItem,
  View: FilterView,
  SearchValueTrigger: FilterSearchValueTrigger,
  SearchValueBarItem: FilterSearchValueBarItem,
  Dialog: FilterDialog,
  DialogStringView: FilterDialogStringView,
  DialogDateView: FilterDialogDateView,
  DateView: FilterPopoverDateView,
  Bar: FilterBar,
  BarItem: FilterBarItem,
  BarName: FilterBarName,
  BarButton: FilterBarButton,
  BarClose: FilterBarCloseButton,
  Date: FilterBarDate,
  CommandInput: FilterCommandInput,
});
